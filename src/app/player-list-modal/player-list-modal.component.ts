import { Component } from '@angular/core';
  import { Inject } from '@angular/core';
  import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
  import { Player } from '../models/player.model';

@Component({
  selector: 'app-player-modal',
  templateUrl: './player-list-modal.component.html',
  styleUrls: ['./player-list-modal.component.css'],
})
export class PlayerModalComponent {
  players: Player[];
  modalTitle: string; // Agregar esta línea para definir modalTitle
  dorsal: string | undefined;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PlayerModalComponent>
  ) {
    this.players = data.players;
    this.dorsal = this.data.dorsal;
    this.modalTitle = data.modalTitle; // Asignar el valor adecuado a modalTitle
  }
  ngOnInit() {
    // Accede a los datos completos
    console.log('modal',this.data);
  }

  

  onPlayerClick(player: Player): void {
    const combinedData = {
        player: player,
        data:this.data,
    };

    console.log('modal1',combinedData);
    this.dialogRef.close(combinedData);
}
  onClose(): void {
    this.dialogRef.close();
  }
}
