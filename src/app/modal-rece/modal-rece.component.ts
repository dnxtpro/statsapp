import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-rece',
  templateUrl: './modal-rece.component.html',
  styleUrls: ['./modal-rece.component.css']
})
export class ModalReceComponent implements OnInit {
  zoneData: string = '';
  hoveredElement: string | null = null;
  selectedElement: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalReceComponent>
  ) {
    // initialize zoneData if passed
    this.zoneData = data?.zoneData ?? '';
  }

  ngOnInit(): void {
    console.log('[ModalRece] dialog data:', this.data);
  }

  onElementClick(id: string) {
    this.selectedElement = id;
    console.log('clicked', id);
  }

  onRectClick(id: string) {
    this.selectedElement = id;
    console.log('rect clicked', id);
  }

  onHoverEnter(id: string) {
    this.hoveredElement = id;
  }

  onHoverLeave() {
    this.hoveredElement = null;
  }

  // helper to compute stroke width if needed
  strokeWidthFor(id: string, defaultWidth: number, selectedWidth: number) {
    return this.selectedElement === id ? selectedWidth : defaultWidth;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    // return the selected element and any zone data to the caller
    this.dialogRef.close({ selectedElement: this.selectedElement, zoneData: this.zoneData });
  }
}
