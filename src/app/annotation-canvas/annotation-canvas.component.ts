import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, HostListener, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
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
  selector: 'app-annotation-canvas',
  templateUrl: './annotation-canvas.component.html',
  styleUrl: './annotation-canvas.component.css'
})
export class AnnotationCanvasComponent implements AfterViewInit, OnChanges, OnDestroy {

  @Input() annotations: Annotation[] = [];
  @Input() selectedTool: AnnotationType | 'select' | 'eraser' = 'select';
  @Input() color: string = '#3B82F6';
  @Input() strokeWidth: number = 2;
  @Input() opacity: number = 1.0;
  @Input() currentTime1: number = 0;
  @Input() highlightedAnnotationId: string | null = null;

  @Output() addAnnotation = new EventEmitter<Annotation>();
  @Output() hoverAnnotation = new EventEmitter<{ id: string | null; clientX?: number; clientY?: number }>();

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D | null;

  private isDrawing = false;
  private startPos: { x: number; y: number } | null = null;
  private currentPath: { x: number; y: number }[] = [];
  // Track last client position (page coordinates) for popup placement
  private lastClientPos: { clientX: number; clientY: number } = { clientX: 0, clientY: 0 };
  // cache for generated cursor data-urls per tool
  private cursorUrlCache: Map<string, string> = new Map();

  private resizeObserver?: ResizeObserver;

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    this.adjustCanvasSize();
    this.redraw();

    // observar cambios de tamaño del contenedor para ajustar canvas
    if (typeof (globalThis as any).ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.adjustCanvasSize();
        this.redraw();
      });
      this.resizeObserver.observe(canvas);
    } else {
      // fallback: resize window
      (window as Window).addEventListener('resize', this.onWindowResize);
    }
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    } else {
      (window as Window).removeEventListener('resize', this.onWindowResize);
    }
  }

  // re-dibujar cuando cambian inputs (annotations o currentTime1 u otros)
  ngOnChanges(changes: SimpleChanges) {
    if (changes['annotations'] || changes['currentTime1'] || changes['color'] || changes['opacity'] || changes['highlightedAnnotationId']) {
      // small debounce could be added if necessary
      this.redraw();
    }
  }

  private onWindowResize = () => {
    this.adjustCanvasSize();
    this.redraw();
  };

  private adjustCanvasSize() {
    const canvas = this.canvasRef.nativeElement;
    // usar devicePixelRatio para evitar blurriness en pantallas HiDPI
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    this.ctx = ctx;
  }

  // Redibuja todas las anotaciones y la vista previa
  private redraw() {
    if (!this.ctx) return;
    const canvas = this.canvasRef.nativeElement;
    // NOTE: si ajustaste el scale en adjustCanvasSize, clearRect usa dimensiones en CSS px
    this.ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));

    // Dibujar anotaciones existentes
    this.annotations
      .filter(a => a.visible && Math.abs(a.timestamp - this.currentTime1) < 0.5)
      .forEach(a => {
        this.drawAnnotation(a);
        
        // Add pulsing highlight effect for selected annotation
        if (a.id === this.highlightedAnnotationId) {
          this.drawHighlightEffect(a);
        }
      });

    // Dibujar línea actual si se está dibujando (solo para herramientas que dibujan trazos libres)
    if (this.isDrawing && this.currentPath.length > 0 && (this.selectedTool === 'pen' || this.selectedTool === 'highlight' || this.selectedTool === 'eraser')) {
      // aplicar comportamiento distinto para eraser / highlight / pen
      if (this.selectedTool === 'eraser') {
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.strokeStyle = '#000'; // color ignorado para eraser (destination-out)
        this.ctx.lineWidth = this.strokeWidth;
        this.ctx.globalAlpha = 1.0;
      } else if (this.selectedTool === 'highlight') {
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = (this.strokeWidth || 2) * 3; // mayor grosor para highlight
        this.ctx.globalAlpha = Math.max(0.15, this.opacity * 0.5);
      } else {
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.strokeWidth;
        this.ctx.globalAlpha = this.opacity;
      }

      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(this.currentPath[0].x, this.currentPath[0].y);
      this.currentPath.forEach(point => this.ctx?.lineTo(point.x, point.y));
      this.ctx.stroke();

      // restaurar composición por defecto
      this.ctx.globalAlpha = 1;
      this.ctx.globalCompositeOperation = 'source-over';
    }

    // Dibujar preview de shapes
    if (this.isDrawing && this.startPos && this.selectedTool !== 'pen' && this.selectedTool !== 'highlight') {
      const endPos = this.currentPath[this.currentPath.length - 1];
      if (endPos) this.drawPreview(this.selectedTool, this.startPos, endPos);
    }

    this.ctx.globalAlpha = 1;
  }

  private drawAnnotation(annotation: Annotation) {
    if (!this.ctx) return;
    const ctx = this.ctx;
      // Preparar estilos según el tipo
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (annotation.type === 'eraser') {
        // El eraser actúa usando destination-out para 'borrar' visualmente
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = annotation.strokeWidth || 12;
        ctx.globalAlpha = 1.0;
      } else if (annotation.type === 'highlight') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = annotation.color;
        ctx.fillStyle = annotation.color;
        ctx.lineWidth = annotation.strokeWidth || 12;
        ctx.globalAlpha = Math.max(0.15, annotation.opacity * 0.5);
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = annotation.color;
        ctx.fillStyle = annotation.color;
        ctx.lineWidth = annotation.strokeWidth || 2;
        ctx.globalAlpha = annotation.opacity;
      }

    switch (annotation.type) {
        case 'pen':
        case 'highlight':
          if (annotation.data.points && annotation.data.points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(annotation.data.points[0].x, annotation.data.points[0].y);
            annotation.data.points.forEach((p: { x: number; y: number }) => ctx.lineTo(p.x, p.y));
            ctx.stroke();
          }
          break;
        case 'eraser':
          if (annotation.data.points && annotation.data.points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(annotation.data.points[0].x, annotation.data.points[0].y);
            annotation.data.points.forEach((p: { x: number; y: number }) => ctx.lineTo(p.x, p.y));
            ctx.stroke();
          }
          break;
      case 'line':
        ctx.beginPath();
        ctx.moveTo(annotation.data.start.x, annotation.data.start.y);
        ctx.lineTo(annotation.data.end.x, annotation.data.end.y);
        ctx.stroke();
        break;
      case 'arrow':
        this.drawArrow(annotation.data.start, annotation.data.end);
        break;
      case 'rectangle':
        ctx.strokeRect(annotation.data.x, annotation.data.y, annotation.data.width, annotation.data.height);
        break;
      case 'circle':
        ctx.beginPath();
        ctx.ellipse(annotation.data.cx, annotation.data.cy, annotation.data.rx, annotation.data.ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
    }
  }

  private drawHighlightEffect(annotation: Annotation) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    
    // Save current state
    ctx.save();
    
    // Create a subtle pulsing glow effect around the annotation
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#FFD700'; // Gold color for highlight
    ctx.lineWidth = (annotation.strokeWidth || 2) + 4;
    ctx.globalAlpha = 0.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 15;
    
    // Draw outline based on annotation type
    switch (annotation.type) {
      case 'pen':
      case 'highlight':
      case 'eraser':
        if (annotation.data.points && annotation.data.points.length > 0) {
          ctx.beginPath();
          ctx.moveTo(annotation.data.points[0].x, annotation.data.points[0].y);
          annotation.data.points.forEach((p: { x: number; y: number }) => ctx.lineTo(p.x, p.y));
          ctx.stroke();
        }
        break;
      case 'line':
        ctx.beginPath();
        ctx.moveTo(annotation.data.start.x, annotation.data.start.y);
        ctx.lineTo(annotation.data.end.x, annotation.data.end.y);
        ctx.stroke();
        break;
      case 'arrow':
        ctx.beginPath();
        ctx.moveTo(annotation.data.start.x, annotation.data.start.y);
        ctx.lineTo(annotation.data.end.x, annotation.data.end.y);
        ctx.stroke();
        break;
      case 'rectangle':
        ctx.strokeRect(annotation.data.x, annotation.data.y, annotation.data.width, annotation.data.height);
        break;
      case 'circle':
        ctx.beginPath();
        ctx.ellipse(annotation.data.cx, annotation.data.cy, annotation.data.rx, annotation.data.ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
    }
    
    // Restore previous state
    ctx.restore();
  }

  private drawPreview(tool: string | AnnotationType, start: { x: number; y: number }, end: { x: number; y: number }) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.strokeWidth;
    ctx.globalAlpha = this.opacity * 0.7;
    ctx.lineCap = 'round';

    switch (tool) {
      case 'line':
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        break;
      case 'arrow':
        this.drawArrow(start, end);
        break;
      case 'rectangle':
        ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
        break;
      case 'circle':
        const rx = Math.abs(end.x - start.x) / 2;
        const ry = Math.abs(end.y - start.y) / 2;
        const cx = start.x + (end.x - start.x) / 2;
        const cy = start.y + (end.y - start.y) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
    }
  }

  private drawArrow(start: { x: number; y: number }, end: { x: number; y: number }) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const headLength = 15;

    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - headLength * Math.cos(angle - Math.PI / 6), end.y - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - headLength * Math.cos(angle + Math.PI / 6), end.y - headLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  }

  // =========================
  //       EVENTOS MOUSE
  // =========================

  @HostListener('mousedown', ['$event'])
  handleMouseDown(event: MouseEvent) {
    if (this.selectedTool === 'select') return;
    this.isDrawing = true;
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.startPos = { x, y };
    this.currentPath = [{ x, y }];
    this.redraw();
  }

  @HostListener('mousemove', ['$event'])
  handleMouseMove(event: MouseEvent) {
    // update last client pos for popup placement
    this.lastClientPos = { clientX: event.clientX, clientY: event.clientY };
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // update cursor to show selected tool icon when hovering canvas and a tool is selected
    try {
      const canvasEl = this.canvasRef?.nativeElement;
      const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (inside && this.selectedTool && this.selectedTool !== 'select') {
        const url = this.getCursorForTool(this.selectedTool, this.color);
        if (url) canvasEl.style.cursor = `url("${url}") 12 12, crosshair`;
        else canvasEl.style.cursor = 'crosshair';
      } else {
        // default cursor
        canvasEl.style.cursor = this.selectedTool === 'select' ? 'default' : 'crosshair';
      }
    } catch (e) {
      // ignore cursor set errors
    }

    if (this.isDrawing) {
      this.currentPath = [...this.currentPath, { x, y }];
      this.redraw();
      return;
    }

    // When not drawing, perform a hit test on annotations and emit hover events (only relevant if tool is 'select')
    try {
      // Only emit hover events when in select mode
      if (this.selectedTool === 'select') {
        const hit = this.hitTest(x, y);
        if (hit) {
          this.hoverAnnotation.emit({ id: hit.id, clientX: event.clientX, clientY: event.clientY });
        } else {
          this.hoverAnnotation.emit({ id: null });
        }
      } else {
        // if not select tool, ensure hover cleared
        this.hoverAnnotation.emit({ id: null });
      }
    } catch (e) {
      // noop
    }
  }

  @HostListener('mouseup')
  @HostListener('mouseleave')
  handleMouseUp() {
    if (!this.isDrawing || !this.startPos) return;
    const endPos = this.currentPath[this.currentPath.length - 1];
    if (!endPos) return;

    let annotationData: any = {};
    switch (this.selectedTool) {
      case 'pen':
      case 'highlight':
        annotationData = { points: this.currentPath };
        break;
      case 'line':
      case 'arrow':
        annotationData = { start: this.startPos, end: endPos };
        break;
      case 'rectangle':
        annotationData = {
          x: this.startPos.x,
          y: this.startPos.y,
          width: endPos.x - this.startPos.x,
          height: endPos.y - this.startPos.y,
        };
        break;
      case 'circle':
        const rx = Math.abs(endPos.x - this.startPos.x) / 2;
        const ry = Math.abs(endPos.y - this.startPos.y) / 2;
        const cx = this.startPos.x + (endPos.x - this.startPos.x) / 2;
        const cy = this.startPos.y + (endPos.y - this.startPos.y) / 2;
        annotationData = { cx, cy, rx, ry };
        break;
    }

    // Crear anotación para cualquier herramienta excepto 'select'
    if (this.selectedTool !== 'select') {
      const newAnnotation: Annotation = {
        id: `annotation-${Date.now()}`,
        type: this.selectedTool as AnnotationType,
        timestamp: this.currentTime1,
        visible: true,
        data: annotationData,
        color: this.color,
        strokeWidth: this.strokeWidth,
        opacity: this.opacity,
      };

      // attach popup position in data so parent can place the description field near the pointer
      try {
        newAnnotation.data = { ...(newAnnotation.data || {}), popupPos: { clientX: this.lastClientPos.clientX, clientY: this.lastClientPos.clientY } };
      } catch (e) {
        // noop
      }

      // Log detallado para saber cómo persistir la anotación en BD
      console.log('[AnnotationCanvas] Emitting annotation:', newAnnotation);
      try {
        console.log('[AnnotationCanvas] JSON snapshot:', JSON.stringify(newAnnotation));
      } catch (e) {
        console.warn('[AnnotationCanvas] Could not stringify annotation', e);
      }

      this.addAnnotation.emit(newAnnotation);
    }

    this.isDrawing = false;
    this.startPos = null;
    this.currentPath = [];
    this.redraw();
    // clear hover on mouse up/leave and reset cursor
    try { this.hoverAnnotation.emit({ id: null }); } catch (e) {}
    try { this.canvasRef.nativeElement.style.cursor = this.selectedTool === 'select' ? 'default' : 'crosshair'; } catch (e) {}
  }

  // =========================
  //       EVENTOS TOUCH
  // =========================

  @HostListener('touchstart', ['$event'])
  handleTouchStart(event: TouchEvent) {
    // ignore multi-touch gestures (pinch/zoom)
    if (event.touches.length > 1) return;
    // If tool is select, allow default behavior (scroll/gesture)
    if (this.selectedTool === 'select') return;

    // Prevent page scrolling while drawing on the canvas
    event.preventDefault();

    const touch = event.touches[0];
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    this.isDrawing = true;
    this.startPos = { x, y };
    this.currentPath = [{ x, y }];
    this.redraw();
  }

  @HostListener('touchmove', ['$event'])
  handleTouchMove(event: TouchEvent) {
    if (!this.isDrawing) return;
    if (event.touches.length > 1) return;

    // Prevent scrolling while drawing
    event.preventDefault();
    const touch = event.touches[0];
    // update last client pos for popup placement
    this.lastClientPos = { clientX: touch.clientX, clientY: touch.clientY };
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    this.currentPath = [...this.currentPath, { x, y }];
    this.redraw();
  }

  @HostListener('touchend', ['$event'])
  @HostListener('touchcancel', ['$event'])
  handleTouchEnd(event: TouchEvent) {
    // On touchend, the drawing should finish. Use same logic as mouse up.
    // Do not call preventDefault here; let the browser resume normal behavior after finishing.
    if (!this.isDrawing || !this.startPos) return;

    const endPos = this.currentPath[this.currentPath.length - 1];
    if (!endPos) return;

    let annotationData: any = {};
    switch (this.selectedTool) {
      case 'pen':
      case 'highlight':
        annotationData = { points: this.currentPath };
        break;
      case 'line':
      case 'arrow':
        annotationData = { start: this.startPos, end: endPos };
        break;
      case 'rectangle':
        annotationData = {
          x: this.startPos.x,
          y: this.startPos.y,
          width: endPos.x - this.startPos.x,
          height: endPos.y - this.startPos.y,
        };
        break;
      case 'circle':
        const rx = Math.abs(endPos.x - this.startPos.x) / 2;
        const ry = Math.abs(endPos.y - this.startPos.y) / 2;
        const cx = this.startPos.x + (endPos.x - this.startPos.x) / 2;
        const cy = this.startPos.y + (endPos.y - this.startPos.y) / 2;
        annotationData = { cx, cy, rx, ry };
        break;
    }

    if (this.selectedTool !== 'select') {
      const newAnnotation: Annotation = {
        id: `annotation-${Date.now()}`,
        type: this.selectedTool as AnnotationType,
        timestamp: this.currentTime1,
        visible: true,
        data: annotationData,
        color: this.color,
        strokeWidth: this.strokeWidth,
        opacity: this.opacity,
      };

      // attach popupPos from last known client coords (touch)
      try {
        newAnnotation.data = { ...(newAnnotation.data || {}), popupPos: { clientX: this.lastClientPos.clientX, clientY: this.lastClientPos.clientY } };
      } catch (e) { /* noop */ }

      console.log('[AnnotationCanvas] Emitting annotation (touch):', newAnnotation);
      try {
        console.log('[AnnotationCanvas] JSON snapshot:', JSON.stringify(newAnnotation));
      } catch (e) {
        console.warn('[AnnotationCanvas] Could not stringify annotation', e);
      }

      this.addAnnotation.emit(newAnnotation);
    }

    this.isDrawing = false;
    this.startPos = null;
    this.currentPath = [];
    this.redraw();
    try { this.hoverAnnotation.emit({ id: null }); } catch (e) {}
  }

  /**
   * Hit test annotations at canvas-local coords (x,y). Returns the annotation if pointer is over it.
   */
  private hitTest(x: number, y: number): Annotation | null {
    const thresholdBase = 8;
    const candidates = this.annotations.filter(a => a.visible && Math.abs(a.timestamp - this.currentTime1) < 0.5);

    for (let i = candidates.length - 1; i >= 0; i--) {
      const a = candidates[i];
      try {
        switch (a.type) {
          case 'pen':
          case 'highlight':
          case 'eraser':
            if (a.data?.points && Array.isArray(a.data.points)) {
              const pts = a.data.points as { x: number; y: number }[];
              const th = (a.strokeWidth || this.strokeWidth || 2) * 1.5 + thresholdBase;
              for (const p of pts) {
                const dx = p.x - x;
                const dy = p.y - y;
                if ((dx * dx + dy * dy) <= th * th) return a;
              }
            }
            break;
          case 'rectangle':
            const rx = a.data.x;
            const ry = a.data.y;
            const rw = a.data.width;
            const rh = a.data.height;
            if (x >= rx && x <= rx + rw && y >= ry && y <= ry + rh) return a;
            break;
          case 'circle':
            const cx = a.data.cx;
            const cy = a.data.cy;
            const rX = a.data.rx || 0;
            const rY = a.data.ry || rX;
            // normalized ellipse equation
            if (((x - cx) * (x - cx)) / (rX * rX + 1e-6) + ((y - cy) * (y - cy)) / (rY * rY + 1e-6) <= 1) return a;
            break;
          case 'line':
          case 'arrow':
            const s = a.data.start;
            const e = a.data.end;
            if (s && e) {
              const dist = this.pointToSegmentDistance({ x, y }, s, e);
              const th = (a.strokeWidth || this.strokeWidth || 2) * 1.2 + 6;
              if (dist <= th) return a;
            }
            break;
        }
      } catch (err) {
        // ignore malformed data
      }
    }

    return null;
  }

  private pointToSegmentDistance(p: { x: number; y: number }, v: { x: number; y: number }, w: { x: number; y: number }) {
    const l2 = (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projx = v.x + t * (w.x - v.x);
    const projy = v.y + t * (w.y - v.y);
    return Math.hypot(p.x - projx, p.y - projy);
  }

  // Build a small SVG data URL representing the selected tool to use as cursor
  private getCursorForTool(tool: string, color: string): string | null {
    if (!tool) return null;
    const key = `${tool}|${color || ''}`;
    if (this.cursorUrlCache.has(key)) return this.cursorUrlCache.get(key) || null;

    // normalize color (ensure hex or fallback to white)
    let c = '#ffffff';
    try { if (color) c = color; } catch (e) {}
    const escColor = encodeURIComponent(c.replace('#', '%23'));

    // SVG shapes approximating Lucide-like icons (simple strokes)
    let svg = '';
    switch (tool) {
      case 'pen':
        svg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M3 21l3-3 11-11 3 3-11 11L3 21z' fill='none' stroke='${c}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>`;
        break;
      case 'line':
        svg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><line x1='4' y1='20' x2='20' y2='4' stroke='${c}' stroke-width='2' stroke-linecap='round'/></svg>`;
        break;
      case 'arrow':
        svg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><line x1='5' y1='12' x2='19' y2='12' stroke='${c}' stroke-width='2' stroke-linecap='round'/><polyline points='12,5 19,12 12,19' fill='none' stroke='${c}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>`;
        break;
      case 'rectangle':
        svg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><rect x='4' y='6' width='16' height='12' rx='1' ry='1' fill='none' stroke='${c}' stroke-width='2'/></svg>`;
        break;
      case 'circle':
        svg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='7' fill='none' stroke='${c}' stroke-width='2'/></svg>`;
        break;
      case 'text':
        svg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><text x='12' y='16' font-family='Segoe UI, Roboto, Helvetica, Arial, sans-serif' font-size='12' text-anchor='middle' fill='${c}'>T</text></svg>`;
        break;
      case 'highlight':
        svg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M12 2l2.6 6.5L21 10l-5 3.7L17.2 21 12 17.6 6.8 21 8 13.7 3 10l6.4-1.5L12 2z' fill='${c}' stroke='${c}' stroke-width='0.4'/></svg>`;
        break;
      case 'eraser':
        svg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><rect x='3' y='13' width='14' height='6' rx='1' fill='${c}'/><line x1='3' y1='13' x2='17' y2='7' stroke='%23000000' stroke-width='0.8'/></svg>`;
        break;
      default:
        svg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><text x='12' y='16' font-family='Segoe UI, Roboto' font-size='12' text-anchor='middle' fill='${c}'>✎</text></svg>`;
        break;
    }

    // Use base64 encoding for broader browser compatibility when used as cursor data-URL
    let dataUrl: string;
    try {
      // btoa requires a binary string; encodeURIComponent + unescape is a common pattern
      const base64 = (window as any).btoa(unescape(encodeURIComponent(svg)));
      dataUrl = `data:image/svg+xml;base64,${base64}`;
    } catch (e) {
      // fallback to URI-encoded form
      const encoded = encodeURIComponent(svg).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29');
      dataUrl = `data:image/svg+xml;utf8,${encoded}`;
    }
    this.cursorUrlCache.set(key, dataUrl);
    return dataUrl;
  }

}
