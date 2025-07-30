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

  // Dashboard stats
  totalEmployees = signal<number>(0);
  activeDepartments = signal<number>(0);
  pendingApprovals = signal<number>(0);
  totalCompanies = signal<number>(0);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    this.authService.getCurrentUser().subscribe({
      next: user => this.user.set(user),
      error: err => this.user.set(null)
    });
  }

  loadDashboardData(): void {
    this.loading.set(true);

    // Load employees count
    this.authService.getAllEmployees().subscribe({
      next: (employees) => {
        this.totalEmployees.set(employees.length);
        // Count pending approvals
        const pending = employees.filter(emp => emp.status === 'pending').length;
        this.pendingApprovals.set(pending);
      },
      error: (err) => {
        console.error('Error loading employees:', err);
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
}
