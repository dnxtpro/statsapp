// home.component.ts

import { Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../_services/user.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  matches: any[] = []; 
  content?: string;

  constructor(private router: Router,private userService:UserService) {}
  ngOnInit(): void {
    this.userService.getPublicContent().subscribe({
      next: data => {
        this.content = data;
      },
      error: err => {console.log(err)
        if (err.error) {
          this.content = JSON.parse(err.error).message;
        } else {
          this.content = "Error with status: " + err.status;
        }
      }
    });
  }
sidebarAbierto = false;

toggleSidebar() {
  console.log('h')
  this.sidebarAbierto = !this.sidebarAbierto;
}
}
