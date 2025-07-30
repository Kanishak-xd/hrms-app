import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './navbar.html',
    styleUrls: ['./navbar.css']
})
export class NavbarComponent {
    constructor(private router: Router) { }

    navigateToDashboard(): void {
        this.router.navigate(['/dashboard']);
    }

    toggleSidebar(): void {
        // This will be handled by a service to communicate with the sidebar
        // For now, we'll emit an event that the sidebar can listen to
        const event = new CustomEvent('toggleSidebar');
        window.dispatchEvent(event);
    }
} 