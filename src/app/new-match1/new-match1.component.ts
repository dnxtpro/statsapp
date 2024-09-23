
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatchService } from '../services/match.service'; // Asume que tienes un servicio para manejar las solicitudes HTTP
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-match1',
  templateUrl: './new-match1.component.html',
  styleUrl: './new-match1.component.css'
})
export class NewMatch1Component implements OnInit {
  matchForm!: FormGroup;
 data=[]
 teams: any[] = [];
  constructor(private fb: FormBuilder, private matchService: MatchService,private router: Router) {}

  ngOnInit(): void {
    
    this.matchForm = this.fb.group({
      rivalTeam: ['', Validators.required],
      date: ['', Validators.required],
      location: ['', Validators.required],
      equipoId:[''],
    });
    this.matchService.obtenerEquipos().subscribe(data=>{
      this.teams = data;
      console.log(this.teams)
       },)
  }

  onSubmit() {
    if (this.matchForm.valid) {
      const datosPartido = this.matchForm.value;
console.log(datosPartido)
      this.matchService.createMatch(datosPartido).subscribe(
        (response) => {
          console.log('Partido creado:', response);
          this.router.navigate(['/match-live']);
        },
        (error) => {
          console.error('Error al crear partido:', error);
          // Manejar el error, mostrar un mensaje, etc.
        }
      );
    }
  }
}

