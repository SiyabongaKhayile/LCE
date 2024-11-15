import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email: string = '';
  password: string = '';

  // Admin credentials
  private adminEmail: string = 'police@gmail.com';
  private adminPassword: string = '123456';

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  async login() {
    if (!this.email || !this.password) {
      await this.presentAlert('Error', 'Please enter both email and password.');
      return;
    }

    // Check for admin credentials
    if (this.email === this.adminEmail && this.password === this.adminPassword) {
      // Navigate to admin page if credentials are correct
      this.router.navigate(['/admin']);
      return;
    }

    // Show loading controller
    const loading = await this.loadingController.create({
      message: 'Logging in...',
      spinner: 'crescent',
    });
    await loading.present(); // Present the loading controller

    // Attempt to log in as a community member
    const result = await this.authService.login(this.email, this.password);
    await loading.dismiss(); // Dismiss the loading controller after login attempt

    if (result.success) {
      // Navigate to news page for community members
      this.router.navigate(['/news']);
    } else {
      await this.presentAlert('Login Failed', result.message);
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
