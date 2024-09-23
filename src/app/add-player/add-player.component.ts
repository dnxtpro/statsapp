import { Component } from '@angular/core';
import { PlayerService } from '../services/player.service';
import { Player } from '../models/player.model';
import { Position } from '../models/position.model';
import { MatDialog } from '@angular/material/dialog';
import { PlayerDetailsDialogComponent } from '../player-details-dialog/player-details-dialog.component';
import { Router } from '@angular/router';
import { MatchService } from '../services/match.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-player',
  templateUrl: './add-player.component.html',
  styleUrls: ['./add-player.component.css']
})
export class AddPlayerComponent {
  teams: any[] = [];
  positions: any[] = [];
  matchForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private playerService: PlayerService,
    private dialog: MatDialog,
    private router: Router,
    private matchService: MatchService,
  ) {}

  ngOnInit(): void {
    this.loadPositions();
    this.matchService.obtenerEquipos().subscribe(data => {
      this.teams = data;
      console.log(this.teams);
    });

    this.matchForm = this.fb.group({
      name: ['', Validators.required],
      positionId: [0, Validators.required],
      dorsal: [0, [Validators.required, Validators.min(0)]],
      equipoId: [0, Validators.required],
    });
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
    if (this.matchForm.valid) {
      const player = this.matchForm.value;
      console.log(this.matchForm.value);

      this.playerService.addPlayer(player).subscribe((addedPlayer: Player) => {
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
}
