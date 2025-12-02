import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
export type AnnotationType = 'pen' | 'line' | 'arrow' | 'rectangle' | 'circle' | 'text' | 'highlight' | 'eraser';

export interface Annotation {
  id: string;
  type: AnnotationType;
  timestamp: number;
  visible: boolean;
  data: any;
  color: string;
  opacity: number;
  strokeWidth?: number;
  description?: string;
}


@Component({
  selector: 'app-annotation-list',
  templateUrl: './annotation-list.component.html',
  styleUrl: './annotation-list.component.css'
})
export class AnnotationListComponent {

  @Input() annotations: Annotation[] = [];
  @Input() selectedAnnotationId: string | null = null;
  @Input() asidePinned: boolean = false;

  @Output() toggleAsidePin = new EventEmitter<void>();

  @Output() selectAnnotation = new EventEmitter<string>();
  @Output() toggleVisibility = new EventEmitter<string>();
  @Output() deleteAnnotation = new EventEmitter<string>();
  @Output() editAnnotation = new EventEmitter<string>();

  // track expanded state per annotation id
  expanded: { [id: string]: boolean } = {};
  // track menu open state per annotation id (for dropdown menu)
  menuOpen: { [id: string]: boolean } = {};

  toggleExpanded(id: string, event?: Event) {
    if (event) event.stopPropagation();
    this.expanded[id] = !this.expanded[id];
  }

  isExpanded(id: string) {
    return !!this.expanded[id];
  }

  onEdit(annotationId: string, event?: Event) {
    if (event) event.stopPropagation();
    this.editAnnotation.emit(annotationId);
  }

  toggleMenu(annotationId: string, event?: Event) {
    if (event) event.stopPropagation();
    this.menuOpen[annotationId] = !this.menuOpen[annotationId];
  }

  closeMenu(annotationId: string) {
    this.menuOpen[annotationId] = false;
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: Event) {
    // Close all open menus when clicking outside
    const anyOpen = Object.keys(this.menuOpen).some(k => this.menuOpen[k]);
    if (anyOpen) {
      this.menuOpen = {};
    }
  }

  getAnnotationIcon(type: string): string {
    // Return lucide icon name for a given annotation type
    const icons: Record<string, string> = {
      pen: 'pencil',
      line: 'minus',
      arrow: 'arrow-right',
      rectangle: 'square',
      circle: 'circle',
      text: 'type',
      highlight: 'highlighter',
      eraser: 'eraser',
    };
    return icons[type] || 'circle-dot';
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  onSelect(annotationId: string) {
    this.selectAnnotation.emit(annotationId);
  }

  onToggleAsidePin(event?: Event) {
    if (event) event.stopPropagation();
    this.toggleAsidePin.emit();
  }

  onToggle(annotationId: string, event: Event) {
    event.stopPropagation();
    this.toggleVisibility.emit(annotationId);
  }

  onDelete(annotationId: string, event: Event) {
    event.stopPropagation();
    this.deleteAnnotation.emit(annotationId);
  }

}
