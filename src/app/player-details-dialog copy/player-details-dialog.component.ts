// player-details-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { Player } from '../models/player.model';  


@Component({
  selector: 'app-player-details-dialog',
  template: `
    <h2>Detalles del Jugador</h2>
    <p>Nombre: {{ player.player_name }}</p>
    <p>Dorsal: {{ player.dorsal }}</p>
    <p>Posición: {{ player.position_name }}</p>

    <button mat-button (click)="onOkClick()">OK</button>
  `,
})
export class PlayerDetailsDialogComponent {
  player: any; // Declare a variable to store player data

  constructor(
    public dialogRef: MatDialogRef<PlayerDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Assign the received data to the local variable
    this.player = this.data;
  }

  onOkClick(): void {
    // Cierra la ventana modal al hacer clic en OK
    this.dialogRef.close();
  }
}
