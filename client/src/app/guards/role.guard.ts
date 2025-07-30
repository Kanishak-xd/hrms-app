import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]) => {
    return () => {
        const authService = inject(AuthService);
        const router = inject(Router);

        if (!authService.isLoggedIn()) {
            router.navigate(['/login']);
            return false;
        }

        const userRole = authService.getUserRole();

        if (!userRole || !allowedRoles.includes(userRole)) {
            router.navigate(['/dashboard']);
            return false;
        }

        return true;
    };
}; 