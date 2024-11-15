import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage {
  user = {
    username: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
  };

  constructor(private authService: AuthService, private router: Router) {}

  async signUp() {
    console.log('Sign up attempt with:', this.user);

    if (this.user.password !== this.user.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const result = await this.authService.register(this.user);
      if (result.success) {
        alert('Sign up successful!');
        this.router.navigate(['/login']);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      alert('An error occurred during sign up. Please try again.');
    }
  }
}