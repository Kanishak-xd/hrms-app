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
    isLoggedIn = signal(false);

    constructor(
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        // Listen for toggle events from navbar
        window.addEventListener('toggleSidebar', () => {
            this.toggleSidebar();
        });

        // Listen for authentication changes
        window.addEventListener('userLoggedIn', () => {
            this.onUserLoggedIn();
        });

        // Load user info immediately
        this.loadUserInfo();

        // Check authentication status periodically
        this.checkAuthStatus();

        // Force refresh user info after a short delay
        setTimeout(() => {
            this.refreshUserInfo();
        }, 1000);
    }

    onUserLoggedIn(): void {
        console.log('User logged in event detected, updating sidebar...');
        this.loadUserInfo();
        this.checkAuthStatus();
    }

    refreshUserInfo(): void {
        console.log('Refreshing user info...');
        this.checkAuthStatus();
        this.loadUserInfo();
    }

    ngOnDestroy(): void {
        // Clean up event listeners
        window.removeEventListener('toggleSidebar', () => {
            this.toggleSidebar();
        });
        window.removeEventListener('userLoggedIn', () => {
            this.onUserLoggedIn();
        });
    }

    toggleSidebar(): void {
        this.isOpen.set(!this.isOpen());
    }

    closeSidebar(): void {
        this.isOpen.set(false);
    }

    checkAuthStatus(): void {
        const isLoggedIn = this.authService.isLoggedIn();
        this.isLoggedIn.set(isLoggedIn);

        if (isLoggedIn) {
            this.loadUserInfo();
        } else {
            this.userInfo.set(null);
            this.userRole.set(null);
        }
    }

    loadUserInfo(): void {
        // First try to get user info from API
        if (this.authService.isLoggedIn()) {
            this.authService.getCurrentUser().subscribe({
                next: (user) => {
                    console.log('User data from API:', user);
                    this.userInfo.set({
                        name: user.fullName || 'User',
                        email: user.email || 'user@example.com'
                    });
                    this.userRole.set(user.role || null);
                    this.isLoggedIn.set(true);
                    console.log('Sidebar - User role set to:', user.role);
                },
                error: (err) => {
                    console.error('Error loading user from API:', err);
                    // Fallback to token-based info
                    this.loadUserInfoFromToken();
                }
            });
        } else {
            // Fallback to token-based info
            this.loadUserInfoFromToken();
        }
    }

    loadUserInfoFromToken(): void {
        // Get user info from localStorage token as fallback
        const token = this.authService.getToken();
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                console.log('Token payload:', payload);
                this.userInfo.set({
                    name: payload.fullName || 'User',
                    email: payload.email || 'user@example.com'
                });
                this.userRole.set(payload.role || null);
                this.isLoggedIn.set(true);
                console.log('Sidebar - User role from token:', payload.role);
            } catch (e) {
                console.error('Error decoding token:', e);
                this.userInfo.set({
                    name: 'User',
                    email: 'user@example.com'
                });
                this.userRole.set(null);
                this.isLoggedIn.set(false);
            }
        } else {
            this.userInfo.set(null);
            this.userRole.set(null);
            this.isLoggedIn.set(false);
        }
    }

    getUserName(): string {
        const name = this.userInfo()?.name || 'User';
        console.log('getUserName called, returning:', name);
        return name;
    }

    getUserEmail(): string {
        const email = this.userInfo()?.email || 'user@example.com';
        console.log('getUserEmail called, returning:', email);
        return email;
    }

    getUserInitials(): string {
        const name = this.getUserName();
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        console.log('getUserInitials called, returning:', initials);
        return initials;
    }

    getUserRole(): string | null {
        const role = this.userRole();
        console.log('getUserRole called, returning:', role);
        return role;
    }

    isAuthenticated(): boolean {
        return this.isLoggedIn();
    }

    // Role-based navigation methods
    canAccessEmployeeMaster(): boolean {
        const role = this.getUserRole();
        return role === 'hr'; // Only HR users can access employee master
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
        return role === 'hr'; // Only HR users can access HR panel
    }

    hasRole(): boolean {
        const role = this.getUserRole();
        return role !== null && role !== undefined && role !== '';
    }

    navigateTo(route: string): void {
        this.router.navigate([route]);
        this.closeSidebar();
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
        this.closeSidebar();
        // Update auth status after logout
        this.checkAuthStatus();
    }
} 