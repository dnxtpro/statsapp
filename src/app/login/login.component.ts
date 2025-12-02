import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { StorageService } from '../_services/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form: any = {
    username: null,
    password: null
  };
  isLoggedIn = false;
  isLoginFailed = false;
  isRegister = false;
  isLoading=false;
  errorMessage = '';
  roles: string[] = [];
 

  constructor(private authService: AuthService, private storageService: StorageService, private router: Router) { }

  ngOnInit(): void {
    
    if (this.storageService.isLoggedIn()) {
      this.isLoggedIn = true;
      this.roles = this.storageService.getUser().roles;
    }
  }

  onSubmit(): void {
    this.isLoading = true;
    const { username, password } = this.form;

    this.authService.login(username, password).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        this.isLoading=false;
        this.isLoginFailed = false;
        this.isLoggedIn = false;
        this.roles = this.storageService.getUser().roles;
        this.navigateToHome();
      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
        this.isLoading = false;
      }
    });
  }

  navigateToHome(): void {
    this.router.navigate(['/home']);
  }
}