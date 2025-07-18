import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  user = signal<any>(null);

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: user => this.user.set(user),
      error: err => this.user.set(null)
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
