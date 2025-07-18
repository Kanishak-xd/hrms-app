import { Routes } from '@angular/router';
import { Register } from './pages/register/register'
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { HrPanelComponent } from './pages/hr-panel/hr-panel';

export const routes: Routes = [
    { path: 'register', component: Register },
    { path: 'login', component: Login },
    { path: 'dashboard', component: Dashboard },
    { path: 'hr-panel', component: HrPanelComponent },
    { path: '**', redirectTo: 'login' },
];
