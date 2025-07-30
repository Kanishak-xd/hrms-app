import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-emp-master',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './emp-master.html',
    styleUrls: ['./emp-master.css']
})
export class EmpMasterComponent implements OnInit {
    employees = signal<any[]>([]);
    originalEmployees = signal<any[]>([]);
    loading = signal(false);
    error = signal<string | null>(null);
    hasChanges = signal(false);
    userRole = signal<string | null>(null);

    // Filter properties
    filterName = signal<string>('');
    filterEmail = signal<string>('');
    filterDepartment = signal<string>('');
    globalSearch = signal<string>('');
    nameSort = signal<string>('');
    filterRole = signal<string>('');
    filterDesignation = signal<string>('');
    filterStatus = signal<string>('');
    filterGrade = signal<string>('');
    filterPfNumber = signal<string>('');
    filterEsiNumber = signal<string>('');
    filterBankAccount = signal<string>('');
    filterBankName = signal<string>('');
    filterIfscCode = signal<string>('');
    filterFatherName = signal<string>('');
    filterMotherName = signal<string>('');
    filterDob = signal<string>('');
    filterDateOfJoining = signal<string>('');

    // Computed filtered employees
    filteredEmployees = computed(() => {
        let employees = this.employees();
        const globalSearchTerm = this.globalSearch().toLowerCase();
        const nameSortOrder = this.nameSort();

        // Apply global search first
        if (globalSearchTerm) {
            employees = employees.filter(employee => {
                const searchableFields = [
                    employee.fullName || '',
                    employee.email || '',
                    employee.role || '',
                    employee.fatherName || '',
                    employee.motherName || '',
                    employee.dob || '',
                    employee.dateOfJoining || '',
                    employee.department || '',
                    employee.designation || '',
                    employee.pfNumber || '',
                    employee.esiNumber || '',
                    employee.bankAccount || '',
                    employee.bankName || '',
                    employee.ifscCode || '',
                    employee.grade || '',
                    employee.status || ''
                ].map(field => field.toString().toLowerCase());

                return searchableFields.some(field => field.includes(globalSearchTerm));
            });
        }

        // Apply individual filters
        const emailFilter = this.filterEmail().toLowerCase();
        const roleFilter = this.filterRole();
        const departmentFilter = this.filterDepartment();
        const designationFilter = this.filterDesignation();
        const statusFilter = this.filterStatus();
        const gradeFilter = this.filterGrade().toLowerCase();
        const pfNumberFilter = this.filterPfNumber().toLowerCase();
        const esiNumberFilter = this.filterEsiNumber().toLowerCase();
        const bankAccountFilter = this.filterBankAccount().toLowerCase();
        const bankNameFilter = this.filterBankName().toLowerCase();
        const ifscCodeFilter = this.filterIfscCode().toLowerCase();
        const fatherNameFilter = this.filterFatherName().toLowerCase();
        const motherNameFilter = this.filterMotherName().toLowerCase();
        const dobFilter = this.filterDob().toLowerCase();
        const dateOfJoiningFilter = this.filterDateOfJoining().toLowerCase();

        employees = employees.filter(employee => {
            const matchesEmail = !emailFilter || (employee.email && employee.email.toLowerCase().includes(emailFilter));
            const matchesRole = !roleFilter || (employee.role && employee.role === roleFilter);
            const matchesDepartment = !departmentFilter || (employee.department && employee.department === departmentFilter);
            const matchesDesignation = !designationFilter || (employee.designation && employee.designation === designationFilter);
            const matchesStatus = !statusFilter || (employee.status && employee.status === statusFilter);
            const matchesGrade = !gradeFilter || (employee.grade && employee.grade.toLowerCase().includes(gradeFilter));
            const matchesPfNumber = !pfNumberFilter || (employee.pfNumber && employee.pfNumber.toLowerCase().includes(pfNumberFilter));
            const matchesEsiNumber = !esiNumberFilter || (employee.esiNumber && employee.esiNumber.toLowerCase().includes(esiNumberFilter));
            const matchesBankAccount = !bankAccountFilter || (employee.bankAccount && employee.bankAccount.toLowerCase().includes(bankAccountFilter));
            const matchesBankName = !bankNameFilter || (employee.bankName && employee.bankName.toLowerCase().includes(bankNameFilter));
            const matchesIfscCode = !ifscCodeFilter || (employee.ifscCode && employee.ifscCode.toLowerCase().includes(ifscCodeFilter));
            const matchesFatherName = !fatherNameFilter || (employee.fatherName && employee.fatherName.toLowerCase().includes(fatherNameFilter));
            const matchesMotherName = !motherNameFilter || (employee.motherName && employee.motherName.toLowerCase().includes(motherNameFilter));
            const matchesDob = !dobFilter || (employee.dob && employee.dob.toLowerCase().includes(dobFilter));
            const matchesDateOfJoining = !dateOfJoiningFilter || (employee.dateOfJoining && employee.dateOfJoining.toLowerCase().includes(dateOfJoiningFilter));

            return matchesEmail && matchesRole && matchesDepartment && matchesDesignation &&
                matchesStatus && matchesGrade && matchesPfNumber && matchesEsiNumber &&
                matchesBankAccount && matchesBankName && matchesIfscCode && matchesFatherName &&
                matchesMotherName && matchesDob && matchesDateOfJoining;
        });

        // Apply name sorting
        if (nameSortOrder) {
            employees = [...employees].sort((a, b) => {
                const nameA = (a.fullName || '').toLowerCase();
                const nameB = (b.fullName || '').toLowerCase();

                if (nameSortOrder === 'asc') {
                    return nameA.localeCompare(nameB);
                } else {
                    return nameB.localeCompare(nameA);
                }
            });
        }

        return employees;
    });

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.checkUserRole();
        this.loadEmployees();
    }

    checkUserRole(): void {
        this.userRole.set(this.authService.getUserRole());
    }

    loadEmployees(): void {
        this.loading.set(true);
        this.error.set(null);

        this.authService.getAllEmployees().subscribe({
            next: (data) => {
                this.employees.set(data);
                this.originalEmployees.set(JSON.parse(JSON.stringify(data))); // Deep copy
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set('Failed to load employees');
                this.loading.set(false);
            }
        });
    }

    onFieldChange(): void {
        this.hasChanges.set(true);
    }

    saveChanges(): void {
        this.loading.set(true);
        this.error.set(null);

        const currentEmployees = this.employees();
        const originalEmployees = this.originalEmployees();
        const updatedEmployees: any[] = [];

        // Find employees that have changed
        currentEmployees.forEach((employee, index) => {
            const original = originalEmployees[index];
            if (JSON.stringify(employee) !== JSON.stringify(original)) {
                updatedEmployees.push(employee);
            }
        });

        if (updatedEmployees.length === 0) {
            this.loading.set(false);
            return;
        }

        // Update each changed employee
        const updatePromises = updatedEmployees.map(employee =>
            this.authService.updateEmployee(employee._id, employee).toPromise()
        );

        Promise.all(updatePromises)
            .then(() => {
                this.originalEmployees.set(JSON.parse(JSON.stringify(currentEmployees)));
                this.hasChanges.set(false);
                this.loading.set(false);
                alert('Changes saved successfully!');
            })
            .catch((err) => {
                this.error.set('Failed to save changes');
                this.loading.set(false);
            });
    }

    cancelChanges(): void {
        this.employees.set(JSON.parse(JSON.stringify(this.originalEmployees())));
        this.hasChanges.set(false);
    }

    isHR(): boolean {
        return this.userRole() === 'hr';
    }

    clearAllFilters(): void {
        this.globalSearch.set('');
        this.nameSort.set('');
        this.filterEmail.set('');
        this.filterRole.set('');
        this.filterDepartment.set('');
        this.filterDesignation.set('');
        this.filterStatus.set('');
        this.filterGrade.set('');
        this.filterPfNumber.set('');
        this.filterEsiNumber.set('');
        this.filterBankAccount.set('');
        this.filterBankName.set('');
        this.filterIfscCode.set('');
        this.filterFatherName.set('');
        this.filterMotherName.set('');
        this.filterDob.set('');
        this.filterDateOfJoining.set('');
    }
} 