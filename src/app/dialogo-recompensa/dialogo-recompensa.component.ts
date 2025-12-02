import { Component,Inject, } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialogo-recompensa',
  templateUrl: './dialogo-recompensa.component.html',
  styleUrl: './dialogo-recompensa.component.css'
})
export class DialogoRecompensaComponent {
reward: any;
  constructor(
      @Inject(MAT_DIALOG_DATA) public data: any,
      public dialogRef: MatDialogRef<DialogoRecompensaComponent>
    ){
      this.reward = data;
      console.log('Reward:', this.reward,data);
    }
onClose(): void {
  this.dialogRef.close();
}
onCanjear(): void {
  this.dialogRef.close(this.reward); 
  }
}
