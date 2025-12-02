import { Component, EventEmitter, Input, Output } from '@angular/core';

export type OverlayTool = 'pen' | 'line' | 'arrow' | 'rectangle' | 'circle' | 'text' | 'highlight' | 'eraser' | 'select';

@Component({
  selector: 'app-right-overlay',
  templateUrl: './right-overlay.component.html',
  styleUrls: ['./right-overlay.component.css']
})
export class RightOverlayComponent {
  @Input() selectedTool: OverlayTool | null = null;
  @Input() color: string = '#3B82F6';
  @Input() strokeWidth: number = 2;
  @Input() opacity: number = 1;

  @Output() toolSelect = new EventEmitter<OverlayTool>();
  @Output() colorChange = new EventEmitter<string>();
  @Output() strokeWidthChange = new EventEmitter<number>();
  @Output() opacityChange = new EventEmitter<number>();
  @Output() undo = new EventEmitter<void>();
  @Output() redo = new EventEmitter<void>();
  @Output() closeOverlay = new EventEmitter<void>();

  // Local UI state
  showColorPopup = false;
  showWidthPopup = false;
  showOpacityPopup = false;

  // available tools
  tools: { key: OverlayTool; icon: string; title?: string }[] = [
    { key: 'pen', icon: 'Pencil', title: 'Pluma' },
    { key: 'line', icon: 'Minus', title: 'Línea' },
    { key: 'arrow', icon: 'ArrowRight', title: 'Flecha' },
    { key: 'rectangle', icon: 'Square', title: 'Rectángulo' },
    { key: 'circle', icon: 'Circle', title: 'Círculo' },
    { key: 'text', icon: 'Type', title: 'Texto' },
    { key: 'highlight', icon: 'Highlighter', title: 'Resaltar' },
    { key: 'eraser', icon: 'Eraser', title: 'Borrar' },
  ];

  selectTool(key: OverlayTool) {
    this.toolSelect.emit(key);
    this.selectedTool = key;
    // reset popups when selecting a new tool
    this.showColorPopup = false;
    this.showWidthPopup = false;
    this.showOpacityPopup = false;
  }

  // helper used by template if needed to get icon name for a tool key
  getIconFor(key: OverlayTool): string {
    const found = this.tools.find(t => t.key === key);
    return found ? found.icon : 'MousePointer';
  }

  toggleColorPopup() {
    this.showColorPopup = !this.showColorPopup;
    this.showWidthPopup = false;
    this.showOpacityPopup = false;
  }

  toggleWidthPopup() {
    this.showWidthPopup = !this.showWidthPopup;
    this.showColorPopup = false;
    this.showOpacityPopup = false;
  }

  toggleOpacityPopup() {
    this.showOpacityPopup = !this.showOpacityPopup;
    this.showColorPopup = false;
    this.showWidthPopup = false;
  }

  onColorPick(hex: string) {
    this.color = hex;
    this.colorChange.emit(this.color);
    this.showColorPopup = false;
  }

  onWidthChange(val: number) {
    this.strokeWidth = val;
    this.strokeWidthChange.emit(this.strokeWidth);
  }

  onOpacityChange(val: number) {
    this.opacity = val;
    this.opacityChange.emit(this.opacity);
  }

  doUndo() { this.undo.emit(); }
  doRedo() { this.redo.emit(); }

  // emit close overlay to switch back to standard layout
  closeRightOverlay() { this.closeOverlay.emit(); }
}
