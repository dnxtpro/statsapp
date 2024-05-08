import { Component } from '@angular/core';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA,MatDialogRef } from '@angular/material/dialog';
import { Player } from '../models/player.model';

interface SextetoPlayer {
 dorsal:string;
  position: number;
  player_id:number;
}
@Component({
  selector: 'app-sexteto',
  templateUrl: './sexteto.component.html',
  styleUrl: './sexteto.component.css'
})
export class SextetoComponent {
  players: Player[];
  position_name:string;
  dorsal:string;
  selectedPlayers: SextetoPlayer[] = [];
  tieneSaque: boolean = false;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<SextetoComponent>
  ) {
    this.players = data.players;
    this.position_name=data.position_name;
    this.dorsal=data.dorsal;
    
  }
  getPosition(columnIndex: number): number {
    const desiredIndices = [4, 3, 2,5 ,6, 1];
    return desiredIndices[columnIndex]; // Adjust for 1-based positioning
  }
  onSubmit() {
    // Combine player name and position into a SextetoPlayer object
    this.selectedPlayers = this.selectedPlayers.concat(
      this.getSelections().map((data,index) => ({
        dorsal: data.dorsal,
        position: this.getPosition(index),
        player_id: data.playerId // Use playerId directly
      }))
    );
    const newOrder = [5, 2, 1, 0, 3, 4];
    const reorderedPlayers = newOrder.map(index => this.selectedPlayers[index]);
    console.log(reorderedPlayers);
    this.dialogRef.close({ selectedPlayers: reorderedPlayers, tieneSaque: this.tieneSaque });

  }
  getSelections(): { playerId: number, dorsal: string }[] {
    const selectElements = document.querySelectorAll('.form-select') as NodeListOf<HTMLSelectElement>; // Type assertion for clarity
    const selectedData = Array.from(selectElements)
      .filter(element => element instanceof HTMLSelectElement) // Filter for select elements
      .map(select => {
        const [playerId, dorsal] = select.value.split(':');
        return { playerId: parseInt(playerId), dorsal };
      });
    return selectedData;
  }
  toggleTieneSaque() {
    this.tieneSaque = !this.tieneSaque;
    if(this.tieneSaque===true){
      console.log('activo')
    }
    else{console.log('desactivado')}
  }


}
