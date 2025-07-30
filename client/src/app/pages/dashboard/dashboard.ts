import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  user = signal<any>(null);
  userRole = signal<string | null>(null);

  // Dashboard stats
  totalEmployees = signal<number>(0);
  activeDepartments = signal<number>(0);
  totalDesignations = signal<number>(0);
  pendingApprovals = signal<number>(0);
  totalCompanies = signal<number>(0);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    this.authService.getCurrentUser().subscribe({
      next: user => {
        this.user.set(user);
        this.userRole.set(user?.role || null);
      },
      error: err => {
        this.user.set(null);
        this.userRole.set(null);
      }
    });
  }

  loadDashboardData(): void {
    this.loading.set(true);

    // Load employees count - works for both HR and Admin
    this.authService.getEmployeeCount().subscribe({
      next: (response) => {
        this.totalEmployees.set(response.count);
      },
      error: (err) => {
        console.error('Error loading employee count:', err);
        // Fallback to getAllEmployees if count endpoint fails
        this.authService.getAllEmployees().subscribe({
          next: (employees) => {
            this.totalEmployees.set(employees.length);
            // Count pending approvals
            const pending = employees.filter(emp => emp.status === 'pending').length;
            this.pendingApprovals.set(pending);
          },
          error: (err2) => {
            console.error('Error loading employees:', err2);
          }
        });
      }
    });

    // Load departments count
    this.authService.getDepartments().subscribe({
      next: (departments) => {
        const active = departments.filter(dept => dept.status === 'active').length;
        this.activeDepartments.set(active);
      },
      error: (err) => {
        console.error('Error loading departments:', err);
      }
    });

    // Load designations count
    this.authService.getDesignations().subscribe({
      next: (designations) => {
        this.totalDesignations.set(designations.length);
      },
      error: (err) => {
        console.error('Error loading designations:', err);
      }
    });

    // Load companies count
    this.authService.getCompanies().subscribe({
      next: (companies) => {
        this.totalCompanies.set(companies.length);
      },
      error: (err) => {
        console.error('Error loading companies:', err);
      }
    });

    // Set loading to false after a short delay to ensure all data is loaded
    setTimeout(() => {
      this.loading.set(false);
    }, 500);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  // Role-based access control methods
  canAccessEmployeeMaster(): boolean {
    const role = this.userRole();
    return role === 'hr'; // Only HR users can access employee master
  }

  canAccessDepartmentMaster(): boolean {
    const role = this.userRole();
    return role === 'hr' || role === 'admin';
  }

  canAccessDesignationMaster(): boolean {
    const role = this.userRole();
    return role === 'hr' || role === 'admin';
  }

  canAccessCompanyMaster(): boolean {
    const role = this.userRole();
    return role === 'admin';
  }

  canAccessHrPanel(): boolean {
    const role = this.userRole();
    return role === 'hr'; // Only HR users can access HR panel
  }
}
