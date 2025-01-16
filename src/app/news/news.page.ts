import { Component } from '@angular/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Timestamp } from 'firebase/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
})
export class NewsPage {
  selectedSegment: string = 'news';
  auth: any;
  constructor(
    private router: Router,
    private toastController: ToastController,
    private firestore: AngularFirestore,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.landingPostHome();
  }

  landingPostHome() {
    // Your existing news loading logic
  }

  async onSegmentChanged(event: any) {
    const selectedValue = event.detail.value;
    
    if (selectedValue === 'logout') {
      await this.handleLogout();
    } else {
      this.selectedSegment = selectedValue;
      // Handle other segment changes as needed
      switch (selectedValue) {
        case 'profile':
         // this.router.navigate(['/profile']);
          break;
        case 'emergency':
         // this.router.navigate(['/emergency']);
          break;
        // Add other cases as needed
      }
    }
  }

  async handleLogout() {
    const alert = await this.alertController.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            // Reset segment to news
            this.selectedSegment = 'news';
          }
        },
        {
          text: 'Logout',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Logging out...',
              duration: 2000
            });
            await loading.present();

            try {
              await this.auth.signOut();
              await loading.dismiss();
              
              // Clear any stored user data or tokens here
              localStorage.removeItem('user');
              sessionStorage.clear();
              
              // Navigate to login page
              this.router.navigate(['/login'], { replaceUrl: true });
              
              this.presentToast('Successfully logged out');
            } catch (error) {
              await loading.dismiss();
              console.error('Logout error:', error);
              this.presentToast('Error logging out. Please try again.');
            }
          }
        }
      ]
    });

    await alert.present();
  }




  async activateSOS() {
    const alert = await this.alertController.create({
      header: 'Confirm SOS Alert',
      message: 'Are you sure you want to send an SOS report?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('SOS cancelled');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.sendSOSReport();
          }
        }
      ]
    });

    await alert.present();
  }

  private async sendSOSReport() {
    const loading = await this.loadingController.create({
      message: 'Getting your precise location...',
      duration: 20000 // 20 second timeout
    });
    
    try {
      await loading.present();

      // Request permission first
      const permissionStatus = await Geolocation.checkPermissions();
      if (permissionStatus.location !== 'granted') {
        await Geolocation.requestPermissions();
      }

      // Get high-accuracy location
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      // Get current date without time
      const currentDate = new Date();
      const reportDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      );

      // Try multiple geocoding services for better accuracy
      const location = await this.getAccurateAddress(latitude, longitude);

      const sosReport = {
        latitude: latitude,
        longitude: longitude,
        reportDate: reportDate,
        status: 'active',
        location: location,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString()
      };

      await this.firestore.collection('reports').add(sosReport);

      await loading.dismiss();
      this.presentToast(
        `SOS alert sent! Location: ${location}`
      );
    } catch (error) {
      await loading.dismiss();
      console.error('Error in SOS activation:', error);
      this.presentToast(
        'Unable to send SOS alert. Please ensure location services are enabled and try again.'
      );
    }
  }

  async getAccurateAddress(latitude: number, longitude: number): Promise<string> {
    try {
      // Try OpenStreetMap first
      const osmResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?` +
        `format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'SOSApplication/1.0'
          }
        }
      );
      
      const osmData = await osmResponse.json();
      
      // Construct a more precise address
      if (osmData.address) {
        const addr = osmData.address;
        const parts = [];
        
        if (addr.road) parts.push(addr.road);
        if (addr.suburb) parts.push(addr.suburb);
        if (addr.city || addr.town) parts.push(addr.city || addr.town);
        if (addr.state) parts.push(addr.state);
        
        if (parts.length > 0) {
          return parts.join(', ');
        }
      }

      // Fallback to basic display_name if detailed address construction fails
      if (osmData.display_name) {
        return osmData.display_name;
      }

      // Final fallback
      return `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
      console.error('Error getting address:', error);
      return `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
    });
    toast.present();
  }
}