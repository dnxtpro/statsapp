import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { MatchService } from '../services/match.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  teams: any[] = [];
  form: any = {
    username: null,
    email: null,
    password: null,
    
    roles:['']
    
  };
 
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';

  constructor(private authService: AuthService,private matchService:MatchService) { }

  ngOnInit(): void {
  }

  onSubmit(): void {
    const { username, email, password,roles } = this.form;
console.log( username, email, password,roles)
    this.authService.register(username, email, password,roles).subscribe({
      next: data => {
        console.log(data);
        this.isSuccessful = true;
        this.isSignUpFailed = false;
      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
      }
    });
  }
}