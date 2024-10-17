// player-list.component.ts
import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../services/player.service';
import { Player } from '../models/player.model';
import { Router } from '@angular/router';
import { MatchService } from '../services/match.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../_services/user.service';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.css'],
})
export class PlayerListComponent implements OnInit {
  groupedPlayers: { [nombre_equipo: string]: any[] } = {};
  showFormForTeam: { [equipo_name: string]: boolean } = {};
  matchForm!: FormGroup;
  positions: any[] = [];
  equipoIdForTeam: { [equipo_name: string]: number } = {};
  activeTeamForm: string | null = null;
  teams: any[] = [];
  users:any[]=[];
  selectedPlayer: Player | null = null;
  selectedUserId: number | null = null;


  constructor(private userService:UserService,private fb: FormBuilder,private playerService: PlayerService, private router: Router,private matchService: MatchService) {this.getPlayers();}
  navigateToAddPlayer(equipo:string): void {
    this.router.navigate(['/add-player'],{ queryParams: { equipo: equipo }});
  }

  ngOnInit(): void {
    this.getPlayers();
    this.loadPositions();
    this.loadTeams();
    this.loadUsers();
    this.matchForm = this.fb.group({
      name: ['', Validators.required],
      dorsal: ['', Validators.required],
      positionId: ['', Validators.required],
    });
    this.getPlayers();
    this.loadPositions();
    this.loadTeams();
    this.loadUsers();
  }

  getPlayers() {
    this.playerService.getAllPlayers().subscribe((data: Player[]) => {
     console.log(data,'data')
     this.groupPlayersByTeam(data);
    });
  }
  groupPlayersByTeam(players: any[]) {
    this.groupedPlayers = this.teams.reduce((grouped, team) => {
      grouped[team.nombre] = []; // Initialize an empty array for each team
    return grouped;
  }, {});

  // Now, assign players to their respective teams
  players.forEach(player => {
    const nombre_equipo = player.nombre_equipo; // Ensure 'nombre_equipo' exists in player data
    if (this.groupedPlayers[nombre_equipo]) {
      this.groupedPlayers[nombre_equipo].push(player);
    }
  });
}
  createTeam(){
   this.router.navigate(['/add-team'])
  }
  getTeamNames(): string[] {
    return Object.keys(this.groupedPlayers);
  }
  loadUsers(){
    this.userService.getAllUsers().subscribe(
      {
        next: data => {
           console.log(data)
           this.users=data;
        },
        error: err => {console.log(err)
        }
      })
  }
  loadPositions() {
    this.playerService.getAllPositions().subscribe(
      (data: any) => {
        this.positions = data.map((position: any) => ({
          id: position.position_id,
          name: position.position_name
        }));
      },
      (error: any) => {
        console.error('Error fetching positions:', error);
      }
    );
  }
  loadTeams() {
    this.matchService.obtenerEquipos().subscribe(data => {
      this.teams = data;
      console.log(this.teams);
    });

  }
  toggleForm(equipo: string) {
    this.activeTeamForm = this.activeTeamForm === equipo ? null : equipo;
  }
  onSubmit(equipo: string) {
    console.log(this.teams)
    if (this.matchForm.valid) {
      const equipo1 = this.teams.find(team => team.nombre === equipo);
      const playerData = {
        ...this.matchForm.value,
        equipoId: equipo1.id, // Asigna el jugador al equipo correspondiente
      };
      this.playerService.addPlayer(playerData).subscribe(() => {
        this.getPlayers(); // Recargar la lista de jugadores después de agregar
        this.activeTeamForm = null; // Ocultar el formulario después de agregar
      });
    }
  }
  openAssignUserForm(player: Player) {
    console.log(player)
    this.selectedPlayer = player;
    this.selectedUserId = player.player_id;
  }
  closeAssignUserForm() {
    this.selectedPlayer = null;
    this.selectedUserId = null;
  }
  assignUser() {
    if (this.selectedPlayer && this.selectedUserId !== null) {
      console.log(this.selectedPlayer,this.selectedUserId,'wtf')
      this.userService.assignUserToPlayer(this.selectedUserId, this.selectedPlayer.player_id).subscribe(
        () => {
          this.getPlayers(); // Recargar la lista de jugadores después de asignar el usuario
          this.closeAssignUserForm(); // Cerrar el formulario después de asignar
        },
        (error) => {
          console.error('Error assigning user:', error);
        }
      );
    }
  }


}
