import { Component, OnInit, signal } from '@angular/core';
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
} 