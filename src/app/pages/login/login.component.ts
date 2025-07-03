import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; 
import { provideHttpClient } from '@angular/common/http'; 
import Swal from 'sweetalert2';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  // Hardcoded credentials
  private readonly VALID_USERNAME = 'admin';
  private readonly VALID_PASSWORD = 'admin123';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService
  ) {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Simulate loading delay
    setTimeout(() => {
      const { userName, password } = this.loginForm.value;

      // Check hardcoded credentials
      if (userName === this.VALID_USERNAME && password === this.VALID_PASSWORD) {
        this.isLoading = false;
        
        // Create mock user data
        const userData = {
          userName: userName,
          email: 'admin@restaurant.com',
          role: 'admin',
          token: 'mock-jwt-token-' + Date.now()
        };

        // Save user data (if using LoginService)
        // this.loginService.saveUserData(userData);

        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Login Successful',
          text: `Welcome ${userData.userName}!`,
          timer: 2000,
          showConfirmButton: false
        });

        // Navigate to dashboard
        this.router.navigate(['/dashboard']);
      } else {
        this.isLoading = false;
        this.errorMessage = 'Invalid username or password. Please try again.';
        
        // Show error message with SweetAlert
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'Invalid username or password',
          timer: 3000,
          showConfirmButton: false
        });
      }
    }, 1000); // 1 second delay to simulate API call
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}