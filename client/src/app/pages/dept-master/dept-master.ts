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
    isEditing?: boolean;
    originalValues?: {
        departmentName: string;
        description: string;
    };
}

interface DepartmentForm {
    departmentId: string;
    departmentName: string;
    description: string;
    status: 'active' | 'inactive';
}

@Component({
    selector: 'app-dept-master',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './dept-master.html',
    styleUrls: ['./dept-master.css']
})
export class DeptMasterComponent implements OnInit {
    departments = signal<Department[]>([]);
    loading = signal(false);
    error = signal<string | null>(null);
    saving = signal(false);

    // Modal states
    showModal = signal(false);
    showViewModal = signal(false);
    editingDepartment = signal<Department | null>(null);
    selectedDepartment = signal<Department | null>(null);

    // Filter states
    searchTerm = signal<string>('');
    statusFilter = signal<string>('');

    // Form data
    departmentForm: DepartmentForm = {
        departmentId: '',
        departmentName: '',
        description: '',
        status: 'active'
    };

    // Computed filtered departments
    filteredDepartments = computed(() => {
        let departments = this.departments();
        const searchTerm = this.searchTerm().toLowerCase();
        const statusFilter = this.statusFilter();

        if (searchTerm) {
            departments = departments.filter(dept =>
                dept.departmentId.toLowerCase().includes(searchTerm) ||
                dept.departmentName.toLowerCase().includes(searchTerm) ||
                (dept.description && dept.description.toLowerCase().includes(searchTerm))
            );
        }

        if (statusFilter) {
            departments = departments.filter(dept => dept.status === statusFilter);
        }

        return departments;
    });

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.loadDepartments();
    }

    loadDepartments(): void {
        this.loading.set(true);
        this.error.set(null);

        this.authService.getDepartments().subscribe({
            next: (departments) => {
                this.departments.set(departments);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set('Failed to load departments');
                this.loading.set(false);
            }
        });
    }

    openAddModal(): void {
        this.editingDepartment.set(null);
        this.resetForm();
        this.showModal.set(true);
    }

    editDepartment(dept: Department): void {
        this.editingDepartment.set(dept);
        this.departmentForm = {
            departmentId: dept.departmentId,
            departmentName: dept.departmentName,
            description: dept.description || '',
            status: dept.status
        };
        this.showModal.set(true);
    }

    viewDepartment(dept: Department): void {
        this.selectedDepartment.set(dept);
        this.showViewModal.set(true);
    }

    saveDepartment(): void {
        this.saving.set(true);
        this.error.set(null);

        if (this.editingDepartment()) {
            // Update existing department
            this.authService.updateDepartment(this.editingDepartment()!._id!, {
                departmentName: this.departmentForm.departmentName,
                description: this.departmentForm.description,
                status: this.departmentForm.status
            }).subscribe({
                next: (updatedDept) => {
                    // Update in the list
                    const departments = this.departments();
                    const index = departments.findIndex(d => d._id === this.editingDepartment()?._id);
                    if (index !== -1) {
                        departments[index] = updatedDept;
                        this.departments.set([...departments]);
                    }
                    this.saving.set(false);
                    this.closeModal();
                },
                error: (err) => {
                    this.error.set('Failed to update department');
                    this.saving.set(false);
                }
            });
        } else {
            // Add new department
            this.authService.createDepartment(this.departmentForm).subscribe({
                next: (newDept) => {
                    this.departments.set([...this.departments(), newDept]);
                    this.saving.set(false);
                    this.closeModal();
                },
                error: (err) => {
                    this.error.set('Failed to create department');
                    this.saving.set(false);
                }
            });
        }
    }

    toggleStatus(dept: Department): void {
        this.authService.toggleDepartmentStatus(dept._id!).subscribe({
            next: (updatedDept) => {
                const departments = this.departments();
                const index = departments.findIndex(d => d._id === dept._id);
                if (index !== -1) {
                    departments[index] = updatedDept;
                    this.departments.set([...departments]);
                }
            },
            error: (err) => {
                this.error.set('Failed to toggle department status');
            }
        });
    }

    deleteDepartment(dept: Department): void {
        if (confirm(`Are you sure you want to delete department "${dept.departmentName}"?`)) {
            this.authService.deleteDepartment(dept._id!).subscribe({
                next: () => {
                    const departments = this.departments();
                    const filtered = departments.filter(d => d._id !== dept._id);
                    this.departments.set(filtered);
                },
                error: (err) => {
                    this.error.set('Failed to delete department');
                }
            });
        }
    }

    // Inline editing methods
    startEdit(dept: Department): void {
        // Store original values for cancel
        dept.originalValues = {
            departmentName: dept.departmentName,
            description: dept.description || ''
        };
        dept.isEditing = true;
    }

    updateDepartment(dept: Department): void {
        this.authService.updateDepartment(dept._id!, {
            departmentName: dept.departmentName,
            description: dept.description,
            status: dept.status
        }).subscribe({
            next: (updatedDept) => {
                // Update in the list
                const departments = this.departments();
                const index = departments.findIndex(d => d._id === dept._id);
                if (index !== -1) {
                    departments[index] = { ...updatedDept, isEditing: false };
                    this.departments.set([...departments]);
                }
                alert('Department updated successfully!');
            },
            error: (err) => {
                this.error.set('Failed to update department');
                // Revert changes on error
                this.cancelEdit(dept);
            }
        });
    }

    cancelEdit(dept: Department): void {
        if (dept.originalValues) {
            dept.departmentName = dept.originalValues.departmentName;
            dept.description = dept.originalValues.description;
        }
        dept.isEditing = false;
        dept.originalValues = undefined;
    }

    closeModal(): void {
        this.showModal.set(false);
        this.editingDepartment.set(null);
        this.resetForm();
    }

    closeViewModal(): void {
        this.showViewModal.set(false);
        this.selectedDepartment.set(null);
    }

    resetForm(): void {
        this.departmentForm = {
            departmentId: this.generateDepartmentId(),
            departmentName: '',
            description: '',
            status: 'active'
        };
    }

    generateDepartmentId(): string {
        const departments = this.departments();
        const maxId = Math.max(...departments.map(d => {
            const num = parseInt(d.departmentId.replace('DEPT', ''));
            return isNaN(num) ? 0 : num;
        }), 0);
        return `DEPT${String(maxId + 1).padStart(3, '0')}`;
    }
} 