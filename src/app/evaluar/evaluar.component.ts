import { Component } from '@angular/core';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Player } from '../models/player.model';

@Component({
  selector: 'app-evaluar',
  templateUrl: './evaluar.component.html',
  styleUrl: './evaluar.component.css',
})
export class EvaluarComponent {
  actions: any[] = [];
   constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<EvaluarComponent>
  ){
    console.log('data evaluar',this.data);
  }
  /**
   * Called when the user clicks one of the action buttons.
   * Emits/closes the dialog returning the selected action array [id,symbol,label,description].
   */
  onActionClick(action: any) {
    console.log('[Evaluar] action clicked', action);
    // Close dialog and return the selected action so the caller can handle it
    try {
      this.dialogRef.close(action);
    } catch (e) {
      // dialogRef may not be provided in all contexts — just log when unavailable
      console.warn('dialogRef.close failed or not available', e);
    }
  }

  /**
   * Map rating symbol to a CSS class name.
   * Matches the original React style names so you can add corresponding CSS rules.
   */
  getRatingClass(symbol: string): string {
    switch (symbol) {
      case '#':
        return 'ratingHash';
      case '+':
        return 'ratingPlus';
      case '!':
        return 'ratingExclamation';
      case '/':
        return 'ratingSlash';
      case '=':
        return 'ratingEqual';
      case '-':
        return 'ratingMinus';
      default:
        return '';
    }
  }

}
