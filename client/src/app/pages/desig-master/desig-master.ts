import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

interface Department {
    _id?: string;
    departmentId: string;
    departmentName: string;
    description?: string;
    status: 'active' | 'inactive';
    createdOn: Date;
    updatedOn: Date;
}

interface Designation {
    _id?: string;
    designationId: string;
    designationName: string;
    departmentId: string;
    level?: string;
    description?: string;
    status: 'active' | 'inactive';
    createdOn: Date;
    updatedOn: Date;
    isEditing?: boolean;
    originalValues?: {
        designationName: string;
        departmentId: string;
        level: string;
        description: string;
    };
}

interface DesignationForm {
    designationId: string;
    designationName: string;
    departmentId: string;
    level: string;
    description: string;
    status: 'active' | 'inactive';
}

@Component({
    selector: 'app-desig-master',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './desig-master.html',
    styleUrls: ['./desig-master.css']
})
export class DesigMasterComponent implements OnInit {
    designations = signal<Designation[]>([]);
    departments = signal<Department[]>([]);
    loading = signal(false);
    error = signal<string | null>(null);
    saving = signal(false);

    // Modal states
    showModal = signal(false);
    showViewModal = signal(false);
    editingDesignation = signal<Designation | null>(null);
    selectedDesignation = signal<Designation | null>(null);

    // Filter states
    searchTerm = signal<string>('');
    statusFilter = signal<string>('');
    departmentFilter = signal<string>('');

    // Form data
    designationForm: DesignationForm = {
        designationId: '',
        designationName: '',
        departmentId: '',
        level: '',
        description: '',
        status: 'active'
    };

    // Computed filtered designations
    filteredDesignations = computed(() => {
        let designations = this.designations();
        const searchTerm = this.searchTerm().toLowerCase();
        const statusFilter = this.statusFilter();
        const departmentFilter = this.departmentFilter();

        if (searchTerm) {
            designations = designations.filter(desig =>
                desig.designationId.toLowerCase().includes(searchTerm) ||
                desig.designationName.toLowerCase().includes(searchTerm) ||
                (desig.description && desig.description.toLowerCase().includes(searchTerm)) ||
                (desig.level && desig.level.toLowerCase().includes(searchTerm))
            );
        }

        if (statusFilter) {
            designations = designations.filter(desig => desig.status === statusFilter);
        }

        if (departmentFilter) {
            designations = designations.filter(desig => desig.departmentId === departmentFilter);
        }

        return designations;
    });

    // Computed active departments
    activeDepartments = computed(() => {
        return this.departments().filter(dept => dept.status === 'active');
    });

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.loadDepartments();
        this.loadDesignations();
    }

    loadDepartments(): void {
        this.authService.getDepartments().subscribe({
            next: (departments) => {
                this.departments.set(departments);
            },
            error: (err) => {
                console.error('Failed to load departments:', err);
            }
        });
    }

    loadDesignations(): void {
        this.loading.set(true);
        this.error.set(null);

        this.authService.getDesignations().subscribe({
            next: (designations) => {
                this.designations.set(designations);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set('Failed to load designations');
                this.loading.set(false);
            }
        });
    }

    getDepartmentName(departmentId?: string): string {
        if (!departmentId) return 'N/A';
        const department = this.departments().find(d => d.departmentId === departmentId);
        return department ? department.departmentName : 'Unknown Department';
    }

    openAddModal(): void {
        this.editingDesignation.set(null);
        this.resetForm();
        this.showModal.set(true);
    }

    editDesignation(desig: Designation): void {
        this.editingDesignation.set(desig);
        this.designationForm = {
            designationId: desig.designationId,
            designationName: desig.designationName,
            departmentId: desig.departmentId,
            level: desig.level || '',
            description: desig.description || '',
            status: desig.status
        };
        this.showModal.set(true);
    }

    viewDesignation(desig: Designation): void {
        this.selectedDesignation.set(desig);
        this.showViewModal.set(true);
    }

    saveDesignation(): void {
        this.saving.set(true);
        this.error.set(null);

        if (this.editingDesignation()) {
            // Update existing designation
            this.authService.updateDesignation(this.editingDesignation()!._id!, {
                designationName: this.designationForm.designationName,
                departmentId: this.designationForm.departmentId,
                level: this.designationForm.level,
                description: this.designationForm.description,
                status: this.designationForm.status
            }).subscribe({
                next: (updatedDesig) => {
                    // Update in the list
                    const designations = this.designations();
                    const index = designations.findIndex(d => d._id === this.editingDesignation()?._id);
                    if (index !== -1) {
                        designations[index] = updatedDesig;
                        this.designations.set([...designations]);
                    }
                    this.saving.set(false);
                    this.closeModal();
                },
                error: (err) => {
                    this.error.set('Failed to update designation');
                    this.saving.set(false);
                }
            });
        } else {
            // Add new designation
            this.authService.createDesignation(this.designationForm).subscribe({
                next: (newDesig) => {
                    this.designations.set([...this.designations(), newDesig]);
                    this.saving.set(false);
                    this.closeModal();
                },
                error: (err) => {
                    this.error.set('Failed to create designation');
                    this.saving.set(false);
                }
            });
        }
    }

    toggleStatus(desig: Designation): void {
        this.authService.toggleDesignationStatus(desig._id!).subscribe({
            next: (updatedDesig) => {
                const designations = this.designations();
                const index = designations.findIndex(d => d._id === desig._id);
                if (index !== -1) {
                    designations[index] = updatedDesig;
                    this.designations.set([...designations]);
                }
            },
            error: (err) => {
                this.error.set('Failed to toggle designation status');
            }
        });
    }

    deleteDesignation(desig: Designation): void {
        if (confirm(`Are you sure you want to delete designation "${desig.designationName}"?`)) {
            this.authService.deleteDesignation(desig._id!).subscribe({
                next: () => {
                    const designations = this.designations();
                    const filtered = designations.filter(d => d._id !== desig._id);
                    this.designations.set(filtered);
                },
                error: (err) => {
                    this.error.set('Failed to delete designation');
                }
            });
        }
    }

    // Inline editing methods
    startEdit(desig: Designation): void {
        // Store original values for cancel
        desig.originalValues = {
            designationName: desig.designationName,
            departmentId: desig.departmentId,
            level: desig.level || '',
            description: desig.description || ''
        };
        desig.isEditing = true;
    }

    updateDesignation(desig: Designation): void {
        this.authService.updateDesignation(desig._id!, {
            designationName: desig.designationName,
            departmentId: desig.departmentId,
            level: desig.level,
            description: desig.description,
            status: desig.status
        }).subscribe({
            next: (updatedDesig) => {
                // Update in the list
                const designations = this.designations();
                const index = designations.findIndex(d => d._id === desig._id);
                if (index !== -1) {
                    designations[index] = { ...updatedDesig, isEditing: false };
                    this.designations.set([...designations]);
                }
                alert('Designation updated successfully!');
            },
            error: (err) => {
                this.error.set('Failed to update designation');
                // Revert changes on error
                this.cancelEdit(desig);
            }
        });
    }

    cancelEdit(desig: Designation): void {
        if (desig.originalValues) {
            desig.designationName = desig.originalValues.designationName;
            desig.departmentId = desig.originalValues.departmentId;
            desig.level = desig.originalValues.level;
            desig.description = desig.originalValues.description;
        }
        desig.isEditing = false;
        desig.originalValues = undefined;
    }

    closeModal(): void {
        this.showModal.set(false);
        this.editingDesignation.set(null);
        this.resetForm();
    }

    closeViewModal(): void {
        this.showViewModal.set(false);
        this.selectedDesignation.set(null);
    }

    resetForm(): void {
        this.designationForm = {
            designationId: this.generateDesignationId(),
            designationName: '',
            departmentId: '',
            level: '',
            description: '',
            status: 'active'
        };
    }

    generateDesignationId(): string {
        const designations = this.designations();
        const maxId = Math.max(...designations.map(d => {
            const num = parseInt(d.designationId.replace('DES', ''));
            return isNaN(num) ? 0 : num;
        }), 0);
        return `DES${String(maxId + 1).padStart(3, '0')}`;
    }
} 