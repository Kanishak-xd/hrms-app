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
            } catch (e) {
                console.error('Error decoding token:', e);
                this.userInfo.set({
                    name: 'User',
                    email: 'user@example.com'
                });
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