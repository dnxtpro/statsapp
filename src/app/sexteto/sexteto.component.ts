import { Component,Input } from '@angular/core';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA,MatDialogRef } from '@angular/material/dialog';
import { Player } from '../models/player.model';


interface SextetoPlayer {
 dorsal:string;
  position: number;
  player_id:number;
}
interface QrData {
  ZN1: string;
  ZN2: string;
  ZN3: string;
  ZN4: string;
  ZN5: string;
  ZN6: string;
}
@Component({
  selector: 'app-sexteto',
  templateUrl: './sexteto.component.html',
  styleUrl: './sexteto.component.css'
})
export class SextetoComponent {
  club:string='CVR'
  qr:QrData[]=[]
  qrset: number = 5;
  sliderValue: number = 1;
  lado: 'A' | 'B' = 'A';
  players: Player[];
  position_name:string;
  dorsal:string;
  selectedPlayers:SextetoPlayer[] = Array(6).fill(null).map(() => ({ dorsal: '', position: 0, player_id: 0 })); 
  tieneSaque: boolean = false;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<SextetoComponent>,
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
   
    console.log(this.selectedPlayers)
    
   
    const newOrder = [5, 2, 1, 0, 3, 4];
    const reorderedPlayers = newOrder.map(index => this.selectedPlayers[index]);
    console.log(reorderedPlayers);
    
    this.dialogRef.close({ selectedPlayers: reorderedPlayers, tieneSaque: this.tieneSaque });

  }
  updateSelectedPlayer(index: number, selectedPlayer: { player_id: number; dorsal: string }) {
    this.selectedPlayers[index] = {
      player_id: selectedPlayer.player_id,
      dorsal: selectedPlayer.dorsal,
      position: this.getPosition(index), // Asegúrate de tener este método que devuelva la posición adecuada
    };
  }
  cambiarLado() {
    this.lado = this.lado === 'A' ? 'B' : 'A';
    console.log(this.lado);
    
  }
  cambiarSet(){
    this.qrset = this.sliderValue;
    console.log("QR set value updated:", this.qrset);

  }
 
  toggleTieneSaque() {
    this.tieneSaque = !this.tieneSaque;
    if(this.tieneSaque===true){
      console.log('activo')
    }
    else{console.log('desactivado')}
  }

  trackByPlayerId(playerId: number): number { 
    return playerId;
  }
  getDorsalFromSelect(value: string): string {
    const dorsal = value[1];
    return dorsal || '';
  }
}
