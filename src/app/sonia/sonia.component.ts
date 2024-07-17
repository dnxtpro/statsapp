import { DialogRef } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-sonia',
  templateUrl: './sonia.component.html',
  styleUrl: './sonia.component.css'
})
export class SoniaComponent {
  constructor(public dialogRef:DialogRef<SoniaComponent>){}
  onClose(): void {
    this.dialogRef.close();
  }
}

