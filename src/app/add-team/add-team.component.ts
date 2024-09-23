import { Component, OnInit } from '@angular/core';
import { MatchService } from '../services/match.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlayerService } from '../services/player.service';

@Component({
  selector: 'app-add-team',
  templateUrl: './add-team.component.html',
  styleUrl: './add-team.component.css'
})
export class AddTeamComponent implements OnInit{
  matchForm!: FormGroup;
  teams: any[] = [];
  constructor(private fb: FormBuilder,private router:Router,private matchService:MatchService,private playerService:PlayerService){}
  ngOnInit(): void {
    this.getPlayers();
    this.matchForm = this.fb.group({
      team: ['', Validators.required],
    
    });
  
      this.matchService.obtenerEquipos().subscribe(data => {
        this.teams = data;
        console.log(this.teams);
      });
  
  }
  getPlayers() {
    this.playerService.getAllPlayers().subscribe(data => {
     console.log(data,'data')
    });
  }
    onSubmit(){
      if (this.matchForm.valid){
        console.log(this.matchForm.value)
        const team= this.matchForm.value;
        this.matchService.addTeam(team).subscribe(
          (response)=>{
            console.log('Equipo creado:',response);
            this.router.navigate(['/player-list'])
          },
          (error)=>{
            console.error('Error al crear equipo', error)
          }
        )
      }
    }

}
