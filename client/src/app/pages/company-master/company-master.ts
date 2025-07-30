import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

interface Company {
    _id?: string;
    companyCode: string;
    companyName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    gstNumber?: string;
    panNumber?: string;
    dateOfIncorporation: Date;
    status: 'active' | 'inactive';
    createdBy?: string;
    createdOn: Date;
    isEditing?: boolean;
    originalValues?: {
        companyName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        country: string;
        pincode: string;
        gstNumber: string;
        panNumber: string;
    };
}

interface CompanyForm {
    companyCode: string;
    companyName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    gstNumber: string;
    panNumber: string;
    dateOfIncorporation: string;
    status: 'active' | 'inactive';
}

@Component({
    selector: 'app-company-master',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './company-master.html',
    styleUrls: ['./company-master.css']
})
export class CompanyMasterComponent implements OnInit {
    companies = signal<Company[]>([]);
    loading = signal(false);
    error = signal<string | null>(null);
    saving = signal(false);
    userRole = signal<string | null>(null);

    // Modal states
    showModal = signal(false);
    showViewModal = signal(false);
    editingCompany = signal<Company | null>(null);
    selectedCompany = signal<Company | null>(null);

    // Filter states
    searchTerm = signal<string>('');
    statusFilter = signal<string>('');
    cityFilter = signal<string>('');

    // Form data
    companyForm: CompanyForm = {
        companyCode: '',
        companyName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        pincode: '',
        gstNumber: '',
        panNumber: '',
        dateOfIncorporation: '',
        status: 'active'
    };

    // Computed filtered companies
    filteredCompanies = computed(() => {
        let companies = this.companies();
        const searchTerm = this.searchTerm().toLowerCase();
        const statusFilter = this.statusFilter();
        const cityFilter = this.cityFilter();

        if (searchTerm) {
            companies = companies.filter(company =>
                company.companyCode.toLowerCase().includes(searchTerm) ||
                company.companyName.toLowerCase().includes(searchTerm) ||
                company.email.toLowerCase().includes(searchTerm) ||
                company.city.toLowerCase().includes(searchTerm) ||
                company.state.toLowerCase().includes(searchTerm)
            );
        }

        if (statusFilter) {
            companies = companies.filter(company => company.status === statusFilter);
        }

        if (cityFilter) {
            companies = companies.filter(company => company.city === cityFilter);
        }

        return companies;
    });

    // Computed unique cities for filter dropdown
    uniqueCities = computed(() => {
        const cities = this.companies().map(company => company.city);
        return [...new Set(cities)].sort();
    });

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.checkUserRole();
        this.loadCompanies();
    }

    checkUserRole(): void {
        const role = this.authService.getUserRole();
        console.log('Current user role from token:', role);
        console.log('Token:', this.authService.getToken());

        if (role) {
            this.userRole.set(role);
        } else {
            // Fallback to API call if token decoding fails
            this.authService.getUserRoleFromAPI().subscribe({
                next: (apiRole: string | null) => {
                    console.log('User role from API:', apiRole);
                    this.userRole.set(apiRole);
                },
                error: (err: any) => {
                    console.error('Error getting user role from API:', err);
                    this.userRole.set(null);
                }
            });
        }
    }

    loadCompanies(): void {
        this.loading.set(true);
        this.error.set(null);

        this.authService.getCompanies().subscribe({
            next: (companies) => {
                this.companies.set(companies);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set('Failed to load companies');
                this.loading.set(false);
            }
        });
    }

    openAddModal(): void {
        this.editingCompany.set(null);
        this.resetForm();
        this.showModal.set(true);
    }

    editCompany(company: Company): void {
        this.editingCompany.set(company);
        this.companyForm = {
            companyCode: company.companyCode,
            companyName: company.companyName,
            email: company.email,
            phone: company.phone,
            address: company.address,
            city: company.city,
            state: company.state,
            country: company.country,
            pincode: company.pincode,
            gstNumber: company.gstNumber || '',
            panNumber: company.panNumber || '',
            dateOfIncorporation: this.formatDateForInput(company.dateOfIncorporation),
            status: company.status
        };
        this.showModal.set(true);
    }

    viewCompany(company: Company): void {
        this.selectedCompany.set(company);
        this.showViewModal.set(true);
    }

    saveCompany(): void {
        this.saving.set(true);
        this.error.set(null);

        if (this.editingCompany()) {
            // Update existing company
            this.authService.updateCompany(this.editingCompany()!._id!, {
                companyName: this.companyForm.companyName,
                email: this.companyForm.email,
                phone: this.companyForm.phone,
                address: this.companyForm.address,
                city: this.companyForm.city,
                state: this.companyForm.state,
                country: this.companyForm.country,
                pincode: this.companyForm.pincode,
                gstNumber: this.companyForm.gstNumber,
                panNumber: this.companyForm.panNumber,
                dateOfIncorporation: new Date(this.companyForm.dateOfIncorporation),
                status: this.companyForm.status
            }).subscribe({
                next: (updatedCompany) => {
                    // Update in the list
                    const companies = this.companies();
                    const index = companies.findIndex(c => c._id === this.editingCompany()?._id);
                    if (index !== -1) {
                        companies[index] = updatedCompany;
                        this.companies.set([...companies]);
                    }
                    this.saving.set(false);
                    this.closeModal();
                },
                error: (err) => {
                    this.error.set('Failed to update company');
                    this.saving.set(false);
                }
            });
        } else {
            // Add new company
            this.authService.createCompany(this.companyForm).subscribe({
                next: (newCompany) => {
                    this.companies.set([...this.companies(), newCompany]);
                    this.saving.set(false);
                    this.closeModal();
                },
                error: (err) => {
                    this.error.set('Failed to create company');
                    this.saving.set(false);
                }
            });
        }
    }

    toggleStatus(company: Company): void {
        this.authService.toggleCompanyStatus(company._id!).subscribe({
            next: (updatedCompany) => {
                const companies = this.companies();
                const index = companies.findIndex(c => c._id === company._id);
                if (index !== -1) {
                    companies[index] = updatedCompany;
                    this.companies.set([...companies]);
                }
            },
            error: (err) => {
                this.error.set('Failed to toggle company status');
            }
        });
    }

    deleteCompany(company: Company): void {
        if (confirm(`Are you sure you want to delete company "${company.companyName}"?`)) {
            this.authService.deleteCompany(company._id!).subscribe({
                next: () => {
                    const companies = this.companies();
                    const filtered = companies.filter(c => c._id !== company._id);
                    this.companies.set(filtered);
                },
                error: (err) => {
                    this.error.set('Failed to delete company');
                }
            });
        }
    }

    // Inline editing methods
    startEdit(company: Company): void {
        // Store original values for cancel
        company.originalValues = {
            companyName: company.companyName,
            email: company.email,
            phone: company.phone,
            address: company.address,
            city: company.city,
            state: company.state,
            country: company.country,
            pincode: company.pincode,
            gstNumber: company.gstNumber || '',
            panNumber: company.panNumber || ''
        };
        company.isEditing = true;
    }

    updateCompany(company: Company): void {
        this.authService.updateCompany(company._id!, {
            companyName: company.companyName,
            email: company.email,
            phone: company.phone,
            address: company.address,
            city: company.city,
            state: company.state,
            country: company.country,
            pincode: company.pincode,
            gstNumber: company.gstNumber,
            panNumber: company.panNumber,
            dateOfIncorporation: company.dateOfIncorporation,
            status: company.status
        }).subscribe({
            next: (updatedCompany) => {
                // Update in the list
                const companies = this.companies();
                const index = companies.findIndex(c => c._id === company._id);
                if (index !== -1) {
                    companies[index] = { ...updatedCompany, isEditing: false };
                    this.companies.set([...companies]);
                }
                alert('Company updated successfully!');
            },
            error: (err) => {
                this.error.set('Failed to update company');
                // Revert changes on error
                this.cancelEdit(company);
            }
        });
    }

    cancelEdit(company: Company): void {
        if (company.originalValues) {
            company.companyName = company.originalValues.companyName;
            company.email = company.originalValues.email;
            company.phone = company.originalValues.phone;
            company.address = company.originalValues.address;
            company.city = company.originalValues.city;
            company.state = company.originalValues.state;
            company.country = company.originalValues.country;
            company.pincode = company.originalValues.pincode;
            company.gstNumber = company.originalValues.gstNumber;
            company.panNumber = company.originalValues.panNumber;
        }
        company.isEditing = false;
        company.originalValues = undefined;
    }

    closeModal(): void {
        this.showModal.set(false);
        this.editingCompany.set(null);
        this.resetForm();
    }

    closeViewModal(): void {
        this.showViewModal.set(false);
        this.selectedCompany.set(null);
    }

    resetForm(): void {
        this.companyForm = {
            companyCode: this.generateCompanyCode(),
            companyName: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            country: '',
            pincode: '',
            gstNumber: '',
            panNumber: '',
            dateOfIncorporation: '',
            status: 'active'
        };
    }

    generateCompanyCode(): string {
        const companies = this.companies();
        const maxId = Math.max(...companies.map(c => {
            const num = parseInt(c.companyCode.replace(/[A-Z]/g, ''));
            return isNaN(num) ? 0 : num;
        }), 0);
        return `COMP${String(maxId + 1).padStart(3, '0')}`;
    }

    formatDateForInput(date: Date): string {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    isAdmin(): boolean {
        const role = this.userRole();
        console.log('Checking Admin access, role:', role);
        return role === 'admin';
    }
} 