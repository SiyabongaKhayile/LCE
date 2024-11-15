import { Component } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
})
export class NewsPage {
  constructor(private toastController: ToastController) {}

  ngOnInit() {
    this.landingPostHome();
  }

  landingPostHome() {
    // Your logic to load news articles dynamically
  }

  async activateSOS() {
    try {
      const position = await Geolocation.getCurrentPosition();
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      
      console.log(`SOS activated! Location: ${latitude}, ${longitude}`);
      
      // Here you would typically send this information to an emergency service
      // For demonstration, we'll just show a toast message
      this.presentToast(`SOS activated! Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    } catch (error) {
      console.error('Error getting location', error);
      this.presentToast('Unable to get location. Please ensure location services are enabled.');
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }
}