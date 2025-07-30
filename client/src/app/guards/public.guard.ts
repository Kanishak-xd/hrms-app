import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const publicGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn()) {
        const userRole = authService.getUserRole();

        // Redirect based on role
        if (userRole === 'admin') {
            router.navigate(['/company-master']);
        } else if (userRole === 'hr') {
            router.navigate(['/hr-panel']);
        } else {
            router.navigate(['/dashboard']);
        }

        return false;
    }

    return true;
}; 