import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './sidebar.html',
    styleUrls: ['./sidebar.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
    isOpen = signal(false);
    userInfo = signal<any>(null);
    userRole = signal<string | null>(null);

    constructor(
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        // Listen for toggle events from navbar
        window.addEventListener('toggleSidebar', () => {
            this.toggleSidebar();
        });

        // Load user info
        this.loadUserInfo();
    }

    ngOnDestroy(): void {
        // Clean up event listener
        window.removeEventListener('toggleSidebar', () => {
            this.toggleSidebar();
        });
    }

    toggleSidebar(): void {
        this.isOpen.set(!this.isOpen());
    }

    closeSidebar(): void {
        this.isOpen.set(false);
    }

    loadUserInfo(): void {
        // Get user info from localStorage or API
        const token = this.authService.getToken();
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                this.userInfo.set({
                    name: payload.fullName || 'User',
                    email: payload.email || 'user@example.com'
                });
                this.userRole.set(payload.role || null);
            } catch (e) {
                console.error('Error decoding token:', e);
                this.userInfo.set({
                    name: 'User',
                    email: 'user@example.com'
                });
                this.userRole.set(null);
            }
        }
    }

    getUserName(): string {
        return this.userInfo()?.name || 'User';
    }

    getUserEmail(): string {
        return this.userInfo()?.email || 'user@example.com';
    }

    getUserInitials(): string {
        const name = this.getUserName();
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    getUserRole(): string | null {
        return this.userRole();
    }

    // Role-based navigation methods
    canAccessEmployeeMaster(): boolean {
        const role = this.getUserRole();
        return role === 'hr' || role === 'admin';
    }

    canAccessDepartmentMaster(): boolean {
        const role = this.getUserRole();
        return role === 'hr' || role === 'admin';
    }

    canAccessDesignationMaster(): boolean {
        const role = this.getUserRole();
        return role === 'hr' || role === 'admin';
    }

    canAccessCompanyMaster(): boolean {
        const role = this.getUserRole();
        return role === 'admin';
    }

    canAccessHrPanel(): boolean {
        const role = this.getUserRole();
        return role === 'hr' || role === 'admin';
    }

    navigateTo(route: string): void {
        this.router.navigate([route]);
        this.closeSidebar();
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
        this.closeSidebar();
    }
} 