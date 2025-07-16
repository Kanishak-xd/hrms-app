import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
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
      grade: [''],
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const formData = this.registerForm.value;
      console.log('Form submitted:', formData);
      // API call
    } else {
      console.log('Form is invalid');
    }
  }
}
