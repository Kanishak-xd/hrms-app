import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private tokenSignal = signal<string | null>(localStorage.getItem('token'));

  // Register user
  register(userData: any): Observable<any> {
    return this.http.post('/api/register', userData);
  }

  // Login user
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post('/api/login', credentials).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          this.tokenSignal.set(res.token);
        }
      })
    );
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('token');
    this.tokenSignal.set(null);
  }

  // Get JWT token
  getToken(): string | null {
    return this.tokenSignal();
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.tokenSignal();
  }

  // Get role or user info from token
  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) {
      console.log('No token found');
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Decoded token payload:', payload);
      return payload.role || null;
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }

  // Alternative method to get user role from API
  getUserRoleFromAPI(): Observable<string | null> {
    return this.http.get<any>('/api/me').pipe(
      tap(user => console.log('Current user from API:', user)),
      map(user => user?.role || null)
    );
  }

  getCurrentUser(): Observable<any> {
    return this.http.get('/api/me');
  }

  getPendingUsers(): Observable<any[]> {
    return this.http.get<any[]>('/api/pending');
  }

  updateUserStatus(userId: string, status: 'approved' | 'rejected') {
    return this.http.patch(`/api/user/${userId}/status`, { status });
  }

  getCompanies(): Observable<any[]> {
    return this.http.get<any[]>('/api/companies');
  }

  // ==================== DEPARTMENT METHODS ====================

  getDepartments(): Observable<any[]> {
    return this.http.get<any[]>('/api/departments');
  }

  createDepartment(departmentData: any): Observable<any> {
    return this.http.post('/api/departments', departmentData);
  }

  updateDepartment(departmentId: string, departmentData: any): Observable<any> {
    return this.http.put(`/api/departments/${departmentId}`, departmentData);
  }

  deleteDepartment(departmentId: string): Observable<any> {
    return this.http.delete(`/api/departments/${departmentId}`);
  }

  toggleDepartmentStatus(departmentId: string): Observable<any> {
    return this.http.patch(`/api/departments/${departmentId}/status`, {});
  }

  // ==================== DESIGNATION METHODS ====================

  getDesignations(): Observable<any[]> {
    return this.http.get<any[]>('/api/designations');
  }

  createDesignation(designationData: any): Observable<any> {
    return this.http.post('/api/designations', designationData);
  }

  updateDesignation(designationId: string, designationData: any): Observable<any> {
    return this.http.put(`/api/designations/${designationId}`, designationData);
  }

  deleteDesignation(designationId: string): Observable<any> {
    return this.http.delete(`/api/designations/${designationId}`);
  }

  toggleDesignationStatus(designationId: string): Observable<any> {
    return this.http.patch(`/api/designations/${designationId}/status`, {});
  }

  getAllEmployees(): Observable<any[]> {
    return this.http.get<any[]>('/api/employees');
  }

  updateEmployee(employeeId: string, employeeData: any): Observable<any> {
    return this.http.put(`/api/employee/${employeeId}`, employeeData);
  }
}
