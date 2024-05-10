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
  selectedPlayers: SextetoPlayer[] = [];
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
    // Combine player name and position into a SextetoPlayer object
    this.selectedPlayers = this.selectedPlayers.concat(
      this.getSelections().map((data,index) => ({
        dorsal: data.dorsal,
        position: this.getPosition(index),
        player_id: data.playerId // Use playerId directly
      }))
    );
    const jsonObject = this.generateJSONObject();
    
    

   
    const newOrder = [5, 2, 1, 0, 3, 4];
    const reorderedPlayers = newOrder.map(index => this.selectedPlayers[index]);
    console.log(reorderedPlayers);
    
    this.dialogRef.close({ selectedPlayers: reorderedPlayers, tieneSaque: this.tieneSaque,jsonObject: jsonObject });

  }
  cambiarLado() {
    if(this.lado)
      {
        this.lado='B'
      }
      else{this.lado='A'}
    console.log(this.lado);
  }
  cambiarSet(){
    this.qrset = this.sliderValue;
    console.log("QR set value updated:", this.qrset);

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

  generateJSONObject(): any {
    const selectedPlayerObject: any = {};
  selectedPlayerObject['ZN1'] = this.selectedPlayers.find(player => player.position === 1)?.dorsal || "";
  selectedPlayerObject['ZN2'] = this.selectedPlayers.find(player => player.position === 2)?.dorsal || "";
  selectedPlayerObject['ZN3'] = this.selectedPlayers.find(player => player.position === 3)?.dorsal || "";
  selectedPlayerObject['ZN4'] = this.selectedPlayers.find(player => player.position === 4)?.dorsal || "";
  selectedPlayerObject['ZN5'] = this.selectedPlayers.find(player => player.position === 5)?.dorsal || "";
  selectedPlayerObject['ZN6'] = this.selectedPlayers.find(player => player.position === 6)?.dorsal || "";

  const jsonObject = [
    this.club,
    this.lado,
    JSON.stringify(selectedPlayerObject),
    this.qrset
  ];
  return jsonObject;
  }

}
