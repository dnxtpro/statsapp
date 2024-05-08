// player-list.component.ts
import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../services/player.service';
import { Player } from '../models/player.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.css'],
})
export class PlayerListComponent implements OnInit {
  players: Player[] = [];

  constructor(private playerService: PlayerService, private router: Router) {}
  navigateToAddPlayer(): void {
    this.router.navigate(['/add-player']);
  }

  ngOnInit(): void {
    this.getPlayers();
  }

  getPlayers() {
    this.playerService.getAllPlayers().subscribe((data: Player[]) => {
      // Asegúrate de que los objetos Player tengan la propiedad positionId
      this.players = data;
    });
  }

}
