import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

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
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch (e) {
      return null;
    }
  }
}
