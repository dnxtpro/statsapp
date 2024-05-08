import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PlayerModalComponent } from '../player-list-modal/player-list-modal.component';
import { Player } from '../models/player.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  constructor(private dialog: MatDialog) {}

  openPlayerModal(players: Player[]): void {
    const dialogRef = this.dialog.open(PlayerModalComponent, {
      width: '80%', // Ajusta el ancho según tus necesidades
      data: { players: players },
    });

    dialogRef.afterClosed().subscribe((selectedPlayer) => {
      if (selectedPlayer) {
        // Aquí puedes manejar los datos del jugador seleccionado
        console.log('Jugador seleccionado:', selectedPlayer);
        // Lógica para guardar los datos y actualizar el marcador
      }
    });
  }
}
