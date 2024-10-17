import { Component, OnInit,inject } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { MatchService } from '../services/match.service';
import {MatSnackBar,MatSnackBarConfig} from '@angular/material/snack-bar';
import { Navigation,Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  private _snackBar = inject(MatSnackBar);

  teams: any[] = [];
  form: any = {
    username: null,
    email: null,
    password: null,
    equipoId:null,
    roles:['user']
    
  };
 
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';

  constructor(private authService: AuthService,private matchService:MatchService,private router:Router) { }
  openSnackBar(errorMessage:string) {
   
      this._snackBar.open(errorMessage,'X',{duration:5000});

 
  
  }

  ngOnInit(): void {
    this.matchService.obtenerEquipos1().subscribe(data=>{
      this.teams = data;
      console.log(this.teams)
       },)
  }

  onSubmit(): void {
   
    const { username, email, password,roles,equipoId } = this.form;
console.log( username, email, password,roles,equipoId)
    this.authService.register(username, email, password,roles,equipoId).subscribe({
      next: data => {
        console.log(data);
        this.isSuccessful = true;
        this.isSignUpFailed = false;
        this.openSnackBar('Perfecto usuario registrado correctamente')
        this.router.navigate(['login'])

      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
        this.openSnackBar(this.errorMessage)
      }
    });
  }
}