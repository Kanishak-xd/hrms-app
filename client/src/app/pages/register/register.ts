import { Component, signal, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  successMessage = signal('');
  errorMessage = signal('');

  registerForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    fatherName: [''],
    motherName: [''],
    dob: [''],
    dateOfJoining: [''],
    department: [''],
    designation: [''],
    pfNumber: [''],
    esiNumber: [''],
    bankAccount: [''],
    bankName: [''],
    ifscCode: [''],
    grade: ['']
  });

  onSubmit() {
    if (this.registerForm.invalid) {
      this.errorMessage.set('Please fill in all required fields');
      return;
    }

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.successMessage.set('Registration successful!');
        this.errorMessage.set('');
        this.registerForm.reset();
      },
      error: (err) => {
        this.errorMessage.set('Registration failed. Try again.');
        this.successMessage.set('');
        console.error(err);
      }
    });
  }
}
