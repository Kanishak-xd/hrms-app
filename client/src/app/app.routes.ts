import { Routes } from '@angular/router';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { HrPanelComponent } from './pages/hr-panel/hr-panel';
import { EmpMasterComponent } from './pages/emp-master/emp-master';
import { DeptMasterComponent } from './pages/dept-master/dept-master';
import { DesigMasterComponent } from './pages/desig-master/desig-master';
import { CompanyMasterComponent } from './pages/company-master/company-master';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { publicGuard } from './guards/public.guard';

export const routes: Routes = [
    // Public routes - only accessible when not logged in
    { path: 'register', component: Register, canActivate: [publicGuard] },
    { path: 'login', component: Login, canActivate: [publicGuard] },

    // Protected routes with role-based access
    { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },

    // HR routes - accessible by HR and Admin
    { path: 'hr-panel', component: HrPanelComponent, canActivate: [roleGuard(['hr', 'admin'])] },
    { path: 'dept-master', component: DeptMasterComponent, canActivate: [roleGuard(['hr', 'admin'])] },
    { path: 'desig-master', component: DesigMasterComponent, canActivate: [roleGuard(['hr', 'admin'])] },

    // Admin routes - accessible only by Admin
    { path: 'company-master', component: CompanyMasterComponent, canActivate: [roleGuard(['admin'])] },

    // Employee master - accessible by HR and Admin
    { path: 'emp-master', component: EmpMasterComponent, canActivate: [roleGuard(['hr', 'admin'])] },

    // Default redirect
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: '**', redirectTo: 'dashboard' },
];
