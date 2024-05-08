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

  navigateToMatchDetails(): void {
    this.router.navigate(['/match-details']);
  }
  navigateToNewMatch(): void {
    this.router.navigate(['/new-match']);
}
navigateToPlayerList(): void {
  this.router.navigate(['/player-list']);
}
}
