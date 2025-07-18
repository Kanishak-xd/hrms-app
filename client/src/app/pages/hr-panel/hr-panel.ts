import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hr-panel',
  standalone: true,
  templateUrl: './hr-panel.html',
  styleUrls: ['./hr-panel.css'],
  imports: [CommonModule]
})
export class HrPanelComponent implements OnInit {
  pendingUsers: any[] = [];
  loading = false;
  error: string | null = null;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.fetchPendingUsers();
  }

  fetchPendingUsers(): void {
    this.loading = true;
    this.authService.getPendingUsers().subscribe({
      next: (users) => {
        this.pendingUsers = users;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load pending users.';
        this.loading = false;
      }
    });
  }

  updateStatus(userId: string, status: 'approved' | 'rejected'): void {
    this.authService.updateUserStatus(userId, status).subscribe({
      next: () => {
        this.pendingUsers = this.pendingUsers.filter(user => user._id !== userId);
      },
      error: () => {
        alert('Failed to update status.');
      }
    });
  }
}
