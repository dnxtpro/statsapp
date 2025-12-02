import { Component,ViewChild,ElementRef,OnInit, AfterViewInit } from '@angular/core';
// allow dynamic import without type errors when heatmap.js isn't in types

import * as h337 from "heatmap.js";
export interface CourtEvent {
  id?: string; // uuid o id de BBDD
  type: 'set' | 'attack';
  x: number; // 0..1 (normalizado)
  y: number; // 0..1 (normalizado)
  playerId?: string;
  matchId?: string;
  timestamp: string; // ISO
}

@Component({
  selector: 'app-set-map',
  templateUrl: './set-map.component.html',
  styleUrl: './set-map.component.css'
})
export class SetMapComponent {
  @ViewChild('courtSvg', { static: true }) courtSvgRef!: ElementRef<SVGSVGElement>;
  @ViewChild('courtContainer', { static: true }) courtContainerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('heatmapContainer', { static: true }) heatmapContainerRef!: ElementRef<HTMLDivElement>;

  // heatmap instance and visibility
  showHeatmap: boolean = false;
  heatmapInstance: any = null;

  // storage key
  private STORAGE_KEY = 'setMap.events';

  // helper: read stored events
  private loadEvents(): CourtEvent[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as CourtEvent[];
    } catch (e) {
      console.warn('set-map: failed to load events', e);
      return [];
    }
  }

  // helper: save events
  private saveEvents(events: CourtEvent[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.warn('set-map: failed to save events', e);
    }
  }

  // public: clear stored events (usable desde template)
  clearStoredEvents() {
    localStorage.removeItem(this.STORAGE_KEY);
    // refresh heatmap if visible
    if (this.showHeatmap) {
      this.renderHeatmap();
    }
  }

  // onSvgClick: captura coordenadas normalizadas y guarda en localStorage
  onSvgClick(event: MouseEvent) {
    const svgEl = this.courtSvgRef?.nativeElement;
    if (!svgEl) return;

    // Try accurate SVG coordinate mapping first
    let xNorm = 0;
    let yNorm = 0;
    try {
      const pt = svgEl.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;
      console.log(pt.x, pt.y);
      const screenCTM = svgEl.getScreenCTM();
      if (screenCTM) {
        const inv = screenCTM.inverse();
        const svgP = pt.matrixTransform(inv);

        // if viewBox is present, normalize by viewBox; otherwise by SVG width/height
        const vb = svgEl.viewBox && svgEl.viewBox.baseVal && svgEl.viewBox.baseVal.width > 0
          ? svgEl.viewBox.baseVal
          : null;

        if (vb) {
          xNorm = (svgP.x - vb.x) / vb.width;
          yNorm = (svgP.y - vb.y) / vb.height;
        } else {
          const rect = svgEl.getBoundingClientRect();
          xNorm = (event.clientX - rect.left) / rect.width;
          yNorm = (event.clientY - rect.top) / rect.height;
        }
      } else {
        // fallback to bounding rect
        const rect = svgEl.getBoundingClientRect();
        xNorm = (event.clientX - rect.left) / rect.width;
        yNorm = (event.clientY - rect.top) / rect.height;
      }
    } catch (e) {
      // fallback safe calculation
      const rect = svgEl.getBoundingClientRect();
      xNorm = (event.clientX - rect.left) / rect.width;
      yNorm = (event.clientY - rect.top) / rect.height;
    }

    // clamp and round
    xNorm = Math.min(1, Math.max(0, Number(xNorm.toFixed(4))));
    yNorm = Math.min(1, Math.max(0, Number(yNorm.toFixed(4))));

    // Determine type: Ctrl+click -> 'attack', otherwise -> 'set'
    const eventType: 'set' | 'attack' = event.ctrlKey ? 'attack' : 'set';

    const newEvent: CourtEvent = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      type: eventType,
      x: xNorm,
      y: yNorm,
      timestamp: new Date().toISOString(),
    };

    // persist
    const events = this.loadEvents();
    events.push(newEvent);
    this.saveEvents(events);

    // pequeño log para depuración
    console.log('[set-map] saved event', newEvent, 'total events:', events.length);

    // opcional: emitir un evento custom o disparar renderHeatmap()
    if (this.showHeatmap) {
      // update heatmap incrementally
      this.renderHeatmap();
    }
  }

  // Initialize heatmap instance attached to the overlay container
  private async initHeatmap() {
    if (this.heatmapInstance) return;
    const container = this.heatmapContainerRef?.nativeElement;
    if (!container) return;
    // Prefer heatmap.js provided globally (faster, avoids dynamic module issues).
    const heatmapLib = h337;
    if (!heatmapLib) {
      console.warn('heatmap.js not found on window. Please include heatmap.js via a <script> tag, or install the npm package.');
      this.heatmapInstance = null;
      return;
    }
    this.heatmapInstance = heatmapLib.create({
      container: container,
      radius: 20,
      maxOpacity: 0.7,
      minOpacity: 0,
      blur: 0.75,
      gradient: {
        0.1: 'blue',
        0.4: 'cyan',
        0.6: 'lime',
        0.8: 'yellow',
        1.0: 'red'
      }
    });
  }

  // Render the heatmap using stored events (normalized coords -> pixels)
  async renderHeatmap() {
    if (!this.heatmapContainerRef) return;
    const container = this.heatmapContainerRef.nativeElement as HTMLElement;
    const svgEl = this.courtSvgRef?.nativeElement as SVGSVGElement | null;
    if (!svgEl) return;

    await this.initHeatmap();
    if (!this.heatmapInstance) return;

    const rect = svgEl.getBoundingClientRect();
    const events = this.loadEvents();

    const points: Array<{ x:number; y:number; value:number }> = [];
    let max = 0;
    for (const ev of events) {
      const x = Math.round(ev.x * rect.width);
      const y = Math.round(ev.y * rect.height);
      const value = ev.type === 'attack' ? 2 : 1;
      points.push({ x, y, value });
      if (value > max) max = value;
    }

    const data = { max: Math.max(max, 1), data: points };
    try {
      // Try the fast path setData; if the library throws (getter-only 'data'),
      // recreate the heatmap instance and add points via addData.
      try {
        this.heatmapInstance.setData(data);
      } catch (err) {
        console.warn('heatmap setData failed, falling back to recreate + addData', err);
        // destroy previous renderer by clearing container DOM
        try { container.innerHTML = ''; } catch (_) {}
        this.heatmapInstance = null;
        await this.initHeatmap();
        if (!this.heatmapInstance) return;
        // addData accepts an array or single point
        if (typeof this.heatmapInstance.addData === 'function') {
          // add all points in a single call when supported
          try {
            this.heatmapInstance.addData(points as any);
          } catch (e2) {
            // fallback to adding one-by-one
            for (const p of points) {
              try { this.heatmapInstance.addData(p as any); } catch (_e) { /* ignore */ }
            }
          }
        } else if (this.heatmapInstance.setData) {
          // last resort
          this.heatmapInstance.setData(data);
        }
        // If we've reached here and heatmapInstance exists but rendering methods failed,
        // fallback to the canvas-based renderer which doesn't rely on heatmap.js internals.
        if (!this.heatmapInstance || (this.heatmapInstance && typeof this.heatmapInstance.setData !== 'function' && typeof this.heatmapInstance.addData !== 'function')) {
          // convert points coordinates are already pixel coords
          this.renderHeatmapCanvas(points, rect);
        }
      }
    } catch (e) {
      console.error('heatmap setData failed', e);
      // final fallback: draw using canvas directly
      try {
        this.renderHeatmapCanvas(points, rect);
      } catch (_xx) { /* ignore */ }
    }
  }

  // Fallback drawing using plain canvas in case heatmap.js APIs fail
  private renderHeatmapCanvas(points: Array<{ x:number; y:number; value:number }>, rect: DOMRect) {
    const container = this.heatmapContainerRef?.nativeElement as HTMLElement;
    if (!container) return;
    // clear container and create canvas
    container.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(rect.width));
    canvas.height = Math.max(1, Math.round(rect.height));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    canvas.style.pointerEvents = 'none';
    canvas.style.position = 'absolute';
    canvas.style.left = '0';
    canvas.style.top = '0';
    // optional CSS blur to soften
    canvas.style.filter = 'blur(12px)';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // use lighter composition to accumulate intensities
    ctx.globalCompositeOperation = 'lighter';

    const baseRadius = 25; // base radius in pixels
    for (const p of points) {
      const px = Math.round(p.x);
      const py = Math.round(p.y);
      const radius = baseRadius + (p.value - 1) * 12;
      const grd = ctx.createRadialGradient(px, py, 0, px, py, radius);
      // color by value: set -> blueish, attack -> reddish
      const color = p.value > 1 ? 'rgba(255,80,0,' : 'rgba(0,120,255,';
      grd.addColorStop(0, `${color}0.65)`);
      grd.addColorStop(0.4, `${color}0.35)`);
      grd.addColorStop(1, `${color}0)`);
      ctx.fillStyle = grd as unknown as string;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2, false);
      ctx.fill();
    }

    // append and keep reference (no heatmapInstance)
    container.appendChild(canvas);
  }

  // Toggle heatmap visibility
  toggleHeatmap() {
    this.showHeatmap = !this.showHeatmap;
    const container = this.heatmapContainerRef?.nativeElement;
    if (container) {
      container.style.display = this.showHeatmap ? 'block' : 'none';
    }
    if (this.showHeatmap) {
      this.renderHeatmap();
    }
  }

  // helper público para que otras partes puedan obtener los eventos y crear el heatmap
  getStoredEvents(): CourtEvent[] {
    return this.loadEvents();
  }

  // ... aquí puedes añadir renderHeatmap() que lea getStoredEvents() y dibuje en un canvas ...
}
