import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './profile.html',
    styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
    user = signal<any>(null);
    loading = signal<boolean>(true);

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.authService.getCurrentUser().subscribe({
            next: (user) => {
                this.user.set(user);
                this.loading.set(false);
            },
            error: () => {
                this.user.set(null);
                this.loading.set(false);
            }
        });
    }
} 