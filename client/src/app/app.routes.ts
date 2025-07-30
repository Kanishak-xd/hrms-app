import { Routes } from '@angular/router';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { HrPanelComponent } from './pages/hr-panel/hr-panel';
import { EmpMasterComponent } from './pages/emp-master/emp-master';
import { DeptMasterComponent } from './pages/dept-master/dept-master';
import { DesigMasterComponent } from './pages/desig-master/desig-master';
import { CompanyMasterComponent } from './pages/company-master/company-master';

export const routes: Routes = [
    { path: 'register', component: Register },
    { path: 'login', component: Login },
    { path: 'dashboard', component: Dashboard },
    { path: 'hr-panel', component: HrPanelComponent },
    { path: 'emp-master', component: EmpMasterComponent },
    { path: 'dept-master', component: DeptMasterComponent },
    { path: 'desig-master', component: DesigMasterComponent },
    { path: 'company-master', component: CompanyMasterComponent },
    { path: '**', redirectTo: 'login' },
];
