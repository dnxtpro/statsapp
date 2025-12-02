import { Component, Input } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-descargar-resumen',
  templateUrl: './descargar-resumen.component.html',
  styleUrls: ['./descargar-resumen.component.css']
})
export class DescargarResumenComponent {
  // Inputs: actions-resume will bind the arrays/objects here
  @Input() playersOverview: any[] = [];
  @Input() saques: any = {};
  @Input() reces: any = {};
  @Input() ataques: any = {};
  @Input() colocacion: any = {};
  @Input() matchInfo: any = {};
  // Chart inputs
  @Input() playerAttackScores: Array<{ name: string; value: number }> = [];
  @Input() breakdownBySymbolPerPlayer: Array<{ name: string; value: number }> = [];
  @Input() playerReceScores: Array<any> = [];
  @Input() breakdownBySymbol: Array<{ name: string; value: number }> = [];
  @Input() playerScores: Array<{ name: string; value: number }> = [];
  @Input() playerColocacionScores: Array<{ name: string; value: number }> = [];
  headerRow1: string[] = ['player', 'receGroup', 'serveGroup', 'attackGroup'];
  playersOverviewColumns: string[] = [
    'player',
    // Reception group
    'receTotal', 'receErr', 'recePosPct', 'recePerfPct',
    // Serve group
    'serveTotal', 'serveErr', 'servePts',
    // Attack group
    'attackTotal', 'attackErr', 'attackBlock', 'attackPts', 'attackPtsPct'
  ];
  /**
   * Capture a DOM element as PNG and download it.
   * Uses html2canvas dynamically imported to keep bundle small.
   */


  /**
   * Prepare a lightweight summary object combining the provided arrays
   * This is what you can pass to a PDF generator or render in a print template.
   */
  getSummaryData() {
    return {
      match: this.matchInfo || {},
      totals: {
        saques: this.saques?.total ?? null,
        reces: this.reces?.total ?? null,
        ataques: this.ataques?.total ?? null,
        colocacion: this.colocacion?.total ?? null,
      },
      bySymbol: {
        saques: this.saques?.bySymbol ?? {},
        reces: this.reces?.bySymbol ?? {},
        ataques: this.ataques?.bySymbol ?? {},
        colocacion: this.colocacion?.bySymbol ?? {},
      },
      playersOverview: Array.isArray(this.playersOverview) ? this.playersOverview : [],
    } as const;
  }

  /**
   * Capture specifically the totals card (#card-totals) and download as PNG.
   * Uses the already-imported html2canvas for rendering.
   */
  async captureTotalsAsPng(fileName = 'totals.png') {
    const el = document.getElementById('descargar-resumen-root');
    if (!el) {
      console.error('Element #descargar-resumen-root not found');
      return;
    }

    try {
      console.log('[DescargarResumen] captureTotalsAsPng: starting capture of #descargar-resumen-root');
      const canvas: HTMLCanvasElement = await (html2canvas as any)(el, {
        scale: 2,
        useCORS: true,
        ignoreElements: (node: any) => {
          try {
            // Ignore known annotation canvases that can be tainted by cross-origin images
            return node instanceof HTMLCanvasElement && node.classList && node.classList.contains('annotation-canvas');
          } catch (_e) {
            return false;
          }
        }
      });
      console.log('[DescargarResumen] captureTotalsAsPng: got canvas', canvas && { width: canvas.width, height: canvas.height });
      const link = document.createElement('a');
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      console.log('[DescargarResumen] captureTotalsAsPng: triggering download', fileName);
      link.click();
    } catch (e) {
      console.error('[DescargarResumen] captureTotalsAsPng failed', e);
    }
  }

  // Store captured images (dataURLs) by element id
  imagesById: Record<string, string> = {};
  // Debug UI state
  debugVisible: boolean = false;
  debugLogs: string[] = [];
  debugImageKeys: string[] = [];

  private pushDebug(msg: string) {
    try {
      const ts = new Date().toISOString();
      this.debugLogs.unshift(`[${ts}] ${msg}`);
      // keep debug log bounded
      if (this.debugLogs.length > 200) this.debugLogs.length = 200;
    } catch (_e) {
      // ignore
    }
  }

  /** UI-facing helper to run the capture+pdf flow and surface results in the debug panel */
  async debugBuildPdf() {
    this.debugVisible = true;
    this.debugLogs = [];
    this.debugImageKeys = [];
    this.pushDebug('Starting debugBuildPdf');

    try {
      const ids = (this.layout && this.layout.length) ? this.layout.map(l => l.id) : [];
      this.pushDebug('Will capture ids: ' + JSON.stringify(ids));
      // clear previous images
      this.imagesById = {};
      await this.captureDivsToImages(ids);
      const keys = Object.keys(this.imagesById || {});
      this.debugImageKeys = keys;
      this.pushDebug('Captured image keys: ' + JSON.stringify(keys));

      // attempt to build PDF (but don't auto-download during debug; use a debug filename)
      const debugFile = 'debug-resumen.pdf';
      try {
        await this.buildCustomPdfFromStoredImages(this.layout, debugFile);
        this.pushDebug('buildCustomPdfFromStoredImages finished, attempted save: ' + debugFile);
      } catch (e) {
        this.pushDebug('buildCustomPdfFromStoredImages threw: ' + String(e));
        console.error('[DescargarResumen] debugBuildPdf: buildCustomPdfFromStoredImages error', e);
      }
    } catch (e) {
      this.pushDebug('debugBuildPdf outer error: ' + String(e));
      console.error('[DescargarResumen] debugBuildPdf outer error', e);
    }
  }

  /**
   * Capture multiple divs by id and store their PNG dataURLs in `imagesById`.
   * Does NOT trigger downloads — images are kept in memory for later PDF assembly.
   *
   * Example: await captureDivsToImages(['card-totals','chart-attack'])
   */
  async captureDivsToImages(ids: string[]) {
    if (!Array.isArray(ids) || ids.length === 0) return;
    console.log('[DescargarResumen] captureDivsToImages: ids=', ids);
    for (const id of ids) {
      try {
        const el = document.getElementById(id);
        if (!el) {
          console.warn('[DescargarResumen] Element not found, skipping:', id);
          continue;
        }

        console.log('[DescargarResumen] captureDivsToImages: capturing element', id);
        const canvas: HTMLCanvasElement = await (html2canvas as any)(el, {
          scale: 2,
          useCORS: true,
          ignoreElements: (node: any) => {
            try {
              return node instanceof HTMLCanvasElement && node.classList && node.classList.contains('annotation-canvas');
            } catch (_e) {
              return false;
            }
          }
        });

        const dataUrl = canvas.toDataURL('image/png');
        this.imagesById[id] = dataUrl;
        console.log('[DescargarResumen] captureDivsToImages: stored image for', id, 'length=', dataUrl.length);
      } catch (e) {
        console.error('[DescargarResumen] captureDivsToImages error for', id, e);
      }
    }
  }

  /**
   * Build a custom PDF using previously captured images in `imagesById`.
   * `layout` is an optional array describing placement per image.
   * If no layout provided, each image will occupy a full page.
   *
   * layout example:
   
   */
  layout = [
  { id: 'card-totals', page: 1, x: 10, y: 10, width: 190 },
  { id: 'chart-attack', page: 2, x: 10, y: 10, width: 190 },
  { id: 'chart-rece-pie', page: 2, x: 10, y: 110, width: 90, height: 60 },
  { id: 'card-table', page: 3, x: 10, y:10, width: 200, height: 200 },
];
  async buildCustomPdfFromStoredImages(layout?: Array<{ id: string; page?: number; x?: number; y?: number; width?: number; height?: number }>, fileName = 'custom-resumen.pdf') {
    console.log('[DescargarResumen] buildCustomPdfFromStoredImages: start', { layout, fileName });
    // Ensure images for all layout ids are captured and stored first
    const idsInLayout = (layout && layout.length > 0) ? layout.map(l => l.id) : Object.keys(this.imagesById);
    const missing = idsInLayout.filter(id => !this.imagesById[id]);
    if (missing.length > 0) {
      console.log('[DescargarResumen] buildCustomPdfFromStoredImages: missing images, capturing now', missing);
      // Capture missing elements into imagesById
      // await captureDivsToImages handles warnings internally
      await this.captureDivsToImages(missing);
      console.log('[DescargarResumen] buildCustomPdfFromStoredImages: after capture, imagesById keys=', Object.keys(this.imagesById));
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const entries = layout && layout.length > 0 ? layout : Object.keys(this.imagesById).map((id, idx) => ({ id, page: idx + 1 }));

    // Group entries by page
    const pages: Record<number, Array<any>> = {};
    for (const e of entries) {
      const page = e.page || 1;
      pages[page] = pages[page] || [];
      pages[page].push(e);
    }

    const pageNumbers = Object.keys(pages).map(n => Number(n)).sort((a, b) => a - b);
    console.log('[DescargarResumen] buildCustomPdfFromStoredImages: pages to render', pageNumbers);

    for (const [pageIndex, pageNum] of pageNumbers.entries()) {
      if (pageIndex > 0) pdf.addPage();
      const items = pages[pageNum];

      for (const item of items) {
        const id = item.id;
        const dataUrl = this.imagesById[id];
        if (!dataUrl) {
          console.warn('[DescargarResumen] No image stored for id', id);
          continue;
        }

        // If width provided, use it; otherwise fit to page width minus 20mm margin
        const targetWidth = item.width || (pdfWidth - 20);

        // Compute height preserving aspect ratio
        let targetHeight = item.height;
        try {
          const imgProps = (pdf as any).getImageProperties(dataUrl);
          targetHeight = targetHeight || (imgProps.height * targetWidth) / imgProps.width;
        } catch (imgErr) {
          console.warn('[DescargarResumen] getImageProperties failed for', id, imgErr);
          // Fallback: use page height minus margins
          targetHeight = targetHeight || (pdfHeight - 20);
        }

        const x = item.x !== undefined ? item.x : 10;
        const y = item.y !== undefined ? item.y : 10;
        console.log('[DescargarResumen] Adding image to PDF', { id, x, y, targetWidth, targetHeight });

        // Force a 25% downscale of the captured image and add to PDF as JPEG.
        // This avoids direct addImage failures caused by very large or complex PNG dataURLs.
        const tryAddImage = async (): Promise<boolean> => {
          try {
            // Load the captured dataURL into an HTMLImageElement to get natural size
            const img = await new Promise<HTMLImageElement>((resolve, reject) => {
              const i = new Image();
              i.onload = () => resolve(i);
              i.onerror = () => reject(new Error('Image load error'));
              i.src = dataUrl;
            });

            // Downscale to 25% of natural pixel dimensions
            const scaleFactor = 0.25;
            const pw = Math.max(1, Math.round(img.width * scaleFactor));
            const ph = Math.max(1, Math.round(img.height * scaleFactor));

            const off = document.createElement('canvas');
            off.width = pw;
            off.height = ph;
            const ctx = off.getContext('2d');
            if (!ctx) throw new Error('Could not get canvas context for scaling');

            // Draw scaled image into canvas
            ctx.drawImage(img, 0, 0, pw, ph);

            // Export as JPEG to reduce complexity and size
            const jpeg = off.toDataURL('image/jpeg', 0.85);

            // Add the downscaled JPEG to PDF using the layout display size (mm)
            (pdf as any).addImage(jpeg, 'JPEG', x, y, targetWidth, targetHeight);
            this.pushDebug(`Added image ${id} as 25% JPEG (${pw}x${ph}px) to PDF`);
            return true;
          } catch (err) {
            console.error('[DescargarResumen] Forced 25% scaled JPEG add failed for', id, err);
            this.pushDebug(`25% scaled add failed for ${id}: ${String(err)}`);
            return false;
          }
        };

        try {
          const ok = await tryAddImage();
          if (!ok) {
            console.error('[DescargarResumen] All addImage strategies failed for', id);
          }
        } catch (outerAddErr) {
          console.error('[DescargarResumen] Unexpected error while adding image for', id, outerAddErr);
        }
      }
    }

    console.log('[DescargarResumen] Saving PDF as', fileName);
    pdf.save(fileName);
    console.log('[DescargarResumen] PDF save triggered');
  }

  /** Clear stored images map */
  clearStoredImages() {
    this.imagesById = {};
  }


}
