import { Component,Input,OnInit } from '@angular/core';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA,MatDialogRef } from '@angular/material/dialog';
import { MatchService } from '../services/match.service';

@Component({
  selector: 'app-resumen-partido',
  templateUrl: './resumen-partido.component.html',
  styleUrl: './resumen-partido.component.css'
})
export class ResumenPartidoComponent implements OnInit {
  constructor(
      @Inject(MAT_DIALOG_DATA) public data: any,
      public dialogRef: MatDialogRef<ResumenPartidoComponent>,

    ){

    } 
    ngOnInit(): void {
      
    }

}
