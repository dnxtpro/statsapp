import { Component, EventEmitter, Input, Output } from '@angular/core';

export type AnnotationType =
  | 'pen'
  | 'line'
  | 'arrow'
  | 'rectangle'
  | 'circle'
  | 'text'
  | 'highlight'
  | 'eraser';

interface Tool {
  id: AnnotationType | 'select' | 'eraser';
  icon: string;
  label: string;
}

@Component({
  selector: 'app-annotation-toolbar',
  templateUrl: './annotation-toolbar.component.html',
  styleUrls: ['./annotation-toolbar.component.css'],
})
export class AnnotationToolbarComponent {
  @Input() selectedTool: AnnotationType | 'select' | 'eraser' = 'select';
  @Input() color: string = '#3B82F6';
  @Input() strokeWidth: number = 4;
  @Input() opacity: number = 1;
  @Input() canUndo = false;
  @Input() canRedo = false;

  @Output() toolSelect = new EventEmitter<AnnotationType | 'select' | 'eraser'>();
  @Output() colorChange = new EventEmitter<string>();
  @Output() strokeWidthChange = new EventEmitter<number>();
  @Output() opacityChange = new EventEmitter<number>();
  @Output() undo = new EventEmitter<void>();
  @Output() redo = new EventEmitter<void>();

  onColorInput(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input && input.value) {
    this.colorChange.emit(input.value);
  }
}
  tools: Tool[] = [
    { id: 'select', icon: 'MousePointer', label: 'Select' },
    { id: 'pen', icon: 'Pencil', label: 'Pen' },
    { id: 'line', icon: 'Minus', label: 'Line' },
    { id: 'arrow', icon: 'ArrowRight', label: 'Arrow' },
    { id: 'rectangle', icon: 'Square', label: 'Rectangle' },
    { id: 'circle', icon: 'Circle', label: 'Circle' },
    { id: 'text', icon: 'Type', label: 'Text' },
    { id: 'highlight', icon: 'Highlighter', label: 'Highlight' },
    { id: 'eraser', icon: 'Eraser', label: 'Eraser' },
  ];

  presetColors = [
    '#EF4444',
    '#F59E0B',
    '#10B981',
    '#3B82F6',
    '#8B5CF6',
    '#EC4899',
    '#FFFFFF',
    '#000000',
  ];
}
