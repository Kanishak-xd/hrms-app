import { Component, signal, inject, OnInit } from '@angular/core';
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
export class Register implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  successMessage = signal('');
  errorMessage = signal('');
  loading = signal(false);

  departments = signal<any[]>([]);
  designations = signal<any[]>([]);
  departmentsLoaded = signal(false);
  designationsLoaded = signal(false);

  constructor() {
    // Load departments and designations dynamically
  }

  ngOnInit(): void {
    this.loadDepartments();
    this.loadDesignations();
  }

  loadDepartments(): void {
    this.authService.getDepartments().subscribe({
      next: (departments) => {
        this.departments.set(departments);
        this.departmentsLoaded.set(true);
      },
      error: (err) => {
        console.error('Error loading departments:', err);
        // Don't show error message for 401 - it's expected for public routes
        if (err.status !== 401) {
          this.errorMessage.set('Failed to load departments');
        }
        this.departmentsLoaded.set(true);
      }
    });
  }

  loadDesignations(): void {
    this.authService.getDesignations().subscribe({
      next: (designations) => {
        this.designations.set(designations);
        this.designationsLoaded.set(true);
      },
      error: (err) => {
        console.error('Error loading designations:', err);
        // Don't show error message for 401 - it's expected for public routes
        if (err.status !== 401) {
          this.errorMessage.set('Failed to load designations');
        }
        this.designationsLoaded.set(true);
      }
    });
  }

  registerForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    fatherName: [''],
    motherName: [''],
    dob: [''],
    dateOfJoining: [''],
    department: [''], // Made optional for registration
    designation: [''], // Made optional for registration
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

    this.loading.set(true);
    this.errorMessage.set('');

    // Prepare form data, filtering out empty department and designation
    const formData = { ...this.registerForm.value };

    // Remove empty department and designation values
    if (!formData.department || formData.department.trim() === '') {
      delete formData.department;
    }
    if (!formData.designation || formData.designation.trim() === '') {
      delete formData.designation;
    }

    this.authService.register(formData).subscribe({
      next: () => {
        this.successMessage.set('Registration successful! Please wait for admin approval.');
        this.errorMessage.set('');
        this.registerForm.reset();
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Registration failed. Try again.');
        this.successMessage.set('');
        this.loading.set(false);
        console.error(err);
      }
    });
  }
}
