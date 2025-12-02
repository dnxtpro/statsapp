import { Component, HostListener, Inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Player } from '../models/player.model';

@Component({
  selector: 'app-player-modal',
  templateUrl: './player-list-modal.component.html',
  styleUrls: ['./player-list-modal.component.css'],
})
export class PlayerModalComponent implements AfterViewInit {
  currentKeys:string = '';
  lastValue: number | null = null;
  processed : boolean = false;
  players: Player[];
  playersFiltered: Player[] = [];
  modalTitle: string; // Agregar esta línea para definir modalTitle
  dorsal: string | undefined;
  allowKeyboard: boolean = false;
  @ViewChild('gridContainer', { static: false })
  gridContainerRef!: ElementRef<HTMLDivElement>;
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
    // Initialize filtered list used while typing
    this.playersFiltered = Array.isArray(this.players) ? [...this.players] : [];
  }

  ngAfterViewInit(): void {
    // Focus the container so it receives keyboard events immediately.
    // Also enable keyboard processing so handleKeyDown will act on typed digits.
    try {
      setTimeout(() => {
        try {
          if (this.gridContainerRef && this.gridContainerRef.nativeElement) {
            this.gridContainerRef.nativeElement.focus();
            this.allowKeyboard = true;
          }
        } catch (e) {
          /* ignore focus failures */
        }
      }, 0);
    } catch (e) {
      /* ignore */
    }
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
  handleKeyDown(event: KeyboardEvent) {
    if (!this.allowKeyboard) {
      return; // Si no se permite el teclado, salir de la función
    } 
    const key = event.key;
    const isNumber = /^[0-9]$/.test(key);
    const isControlKey = key === 'Backspace' || key === 'Delete';
    // If numeric key pressed, append (limit to 2 digits) and filter players
    if (isNumber) {
      // Prevent overly long dorsals; allow up to 2 digits (adjust if needed)
      if (this.currentKeys.length < 2) {
        this.currentKeys += key;
        // update filtered players (startsWith behaviour)
        this.playersFiltered = this.players.filter((player) =>
          player.dorsal !== undefined &&
          player.dorsal !== null &&
          player.dorsal.toString().startsWith(this.currentKeys)
        );
      }
      event.preventDefault();
      return;
    }

    // Handle backspace/delete: remove last char and re-filter
    if (isControlKey) {
      if (this.currentKeys.length > 0) {
        this.currentKeys = this.currentKeys.slice(0, -1);
        this.playersFiltered = this.players.filter((player) =>
          player.dorsal !== undefined &&
          player.dorsal !== null &&
          player.dorsal.toString().startsWith(this.currentKeys)
        );
      } else {
        // nothing to remove, keep full list
        this.playersFiltered = [...this.players];
      }
      event.preventDefault();
      return;
    }

    // Enter: try to select the player
    if (key === 'Enter') {
      event.preventDefault();
      const trimmed = this.currentKeys.trim();
      if (trimmed.length === 0) return;

      // Prefer exact dorsal match
      const exact = this.players.find(
        (player) => player.dorsal !== undefined && player.dorsal.toString() === trimmed
      );
      let toSelect: Player | undefined = exact;

      // If no exact match but only one filtered result, select that one
      if (!toSelect) {
        if (this.playersFiltered.length === 1) {
          toSelect = this.playersFiltered[0];
        }
      }

      if (toSelect) {
        // reuse existing click handler to close dialog with the combined payload
        this.onPlayerClick(toSelect);
        // reset typing state
        this.currentKeys = '';
        this.playersFiltered = [...this.players];
      }
      return;
    }
  }
}
