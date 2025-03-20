import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  currentSection: string = 'home';
  backgroundImages: string[] = [
    '/assets/images/Inkosinathi.jpg',
    '/assets/images/Yaya.jpg'
    // Add more image paths here as needed
  ];
  currentBackgroundIndex: number = 0;
  
  constructor() {}
  
  ngOnInit() {
    // Start the background image rotation
    this.startBackgroundRotation();
  }
  
  showSection(section: string) {
    this.currentSection = section;
  }
  
  startBackgroundRotation() {
    // Change background image every 10 seconds
    setInterval(() => {
      this.currentBackgroundIndex = (this.currentBackgroundIndex + 1) % this.backgroundImages.length;
      this.updateBackgroundImage();
    }, 10000);
  }
  
  updateBackgroundImage() {
    const content = document.querySelector('ion-content') as HTMLElement;
    if (content) {
      content.style.backgroundImage = `url('${this.backgroundImages[this.currentBackgroundIndex]}')`;
    }
  }
}