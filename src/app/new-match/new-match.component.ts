import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatchService } from '../services/match.service'; // Asume que tienes un servicio para manejar las solicitudes HTTP
import { Router } from '@angular/router';


@Component({
  selector: 'app-new-match',
  templateUrl: './new-match.component.html',

})
export class NewMatchComponent implements OnInit {
  matchForm!: FormGroup;
 data=[]
 teams: any[] = [];
  constructor(private fb: FormBuilder, private matchService: MatchService,private router: Router) {}

  ngOnInit(): void {
    
    this.matchForm = this.fb.group({
      rivalTeam: ['', Validators.required],
      date: ['', Validators.required],
      location: ['', Validators.required],
      equipoId:['',Validators.required],
      // modules selection for advanced options in match-live
      modules: this.fb.group({
        recepcion: [false],
        saque: [false],
        ataque: [false],
        colocacion: [false],
        defensa: [false],
        bloqueo: [false],
      })
    });
    // add an 'advanced' toggle to enable/disable modules UI
    this.matchForm.addControl('advanced', this.fb.control(false));

    // disable modules by default and enable when advanced is true
    const modulesGroup = this.matchForm.get('modules');
    if (modulesGroup) {
      modulesGroup.disable({ emitEvent: false });
    }
    this.matchForm.get('advanced')?.valueChanges.subscribe((enabled) => {
      if (modulesGroup) {
        if (enabled) modulesGroup.enable({ emitEvent: false });
        else modulesGroup.disable({ emitEvent: false });
      }
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
      
          const matchId = response && response.id ? response.id : null;
          console.log(matchId)
          if (matchId) {
            this.router.navigate(['/match-live', matchId]);
          } else {
            this.router.navigate(['/match-live']);
          }
        },
        (error) => {
          console.error('Error al crear partido:', error);
          // Manejar el error, mostrar un mensaje, etc.
        }
      );
    }
  }
}
