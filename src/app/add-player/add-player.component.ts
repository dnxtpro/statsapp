// add-player.component.ts
import { Component } from '@angular/core';
import { PlayerService } from '../services/player.service';
import { Player } from '../models/player.model';
import { Position } from '../models/position.model';
import { MatDialog } from '@angular/material/dialog';
import { PlayerDetailsDialogComponent } from '../player-details-dialog/player-details-dialog.component';
import { Router } from '@angular/router'; // Importa Router

@Component({
  selector: 'app-add-player',
  templateUrl: './add-player.component.html',
  styleUrls: ['./add-player.component.css']
})
export class AddPlayerComponent {
  newPlayer: Player = {
    player_id: 0,
    name: '',
    dorsal: 0,
    positionId: 0,
    position_name: ''
  };

  positions: any[] = [];
  selectedPositionId: number = 0;

  constructor(
    private playerService: PlayerService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPositions();
  }

  loadPositions() {
    this.playerService.getAllPositions().subscribe(
      (data: any) => {
        this.positions = data.map((position: any) => ({
          id: position.position_id,
          name: position.position_name
        })) as Position[];
      },
      (error: any) => {
        console.error('Error fetching positions:', error);
      }
    );
  }

  onSubmit() {
    const newPlayer: Player = {
      player_id: 0,
      name: this.newPlayer.name,
      dorsal: this.newPlayer.dorsal,
      positionId: this.selectedPositionId,
      position_name:   ''
    };

    this.playerService.addPlayer(newPlayer).subscribe((addedPlayer: Player) => {
      console.log('Player added:', addedPlayer);
      const dialogRef = this.dialog.open(PlayerDetailsDialogComponent, {
        data: addedPlayer,
      });
      dialogRef.afterClosed().subscribe(() => {
        this.router.navigate(['/player-list']);
      });
    });
  }
}
