// home.component.ts

import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  matches: any[] = []; 
  constructor(private router: Router) {}

sidebarAbierto = false;

toggleSidebar() {
  console.log('h')
  this.sidebarAbierto = !this.sidebarAbierto;
}
}
