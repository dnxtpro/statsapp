import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface CanvasAnnotation {
  id?: number;
  annotation_id?: string;
  type: string;
  timestamp: number;
  visible: boolean;
  color?: string;
  opacity?: number;
  strokeWidth?: number;
  data: any;
  description?: string;
  source?: string;
  matchId?: number;
  eventIndex?: number;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnnotationService {

  constructor(private http: HttpClient) { }

  // Create a new canvas annotation
  createAnnotation(annotation: CanvasAnnotation): Observable<CanvasAnnotation> {
    return this.http.post<CanvasAnnotation>(
      `${environment.apiUrl}/api/anotaciones`,
      annotation
    );
  }

  // Get all annotations (admin/moderator only)
  getAllAnnotations(): Observable<CanvasAnnotation[]> {
    return this.http.get<CanvasAnnotation[]>(
      `${environment.apiUrl}/api/anotaciones`
    );
  }

  // Get annotations by matchId
  getAnnotationsByMatch(matchId: number): Observable<CanvasAnnotation[]> {
    return this.http.get<CanvasAnnotation[]>(
      `${environment.apiUrl}/api/anotaciones/match/${matchId}`
    );
  }

  // Get a single annotation by id
  getAnnotationById(id: number): Observable<CanvasAnnotation> {
    return this.http.get<CanvasAnnotation>(
      `${environment.apiUrl}/api/anotaciones/${id}`
    );
  }

  // Update an annotation (admin/moderator only)
  updateAnnotation(id: number, annotation: Partial<CanvasAnnotation>): Observable<CanvasAnnotation> {
    return this.http.put<CanvasAnnotation>(
      `${environment.apiUrl}/api/anotaciones/${id}`,
      annotation
    );
  }

  // Delete an annotation (admin/moderator only)
  deleteAnnotation(id: number): Observable<any> {
    return this.http.delete(
      `${environment.apiUrl}/api/anotaciones/${id}`
    );
  }

  // Delete all annotations (admin/moderator only)
  deleteAllAnnotations(): Observable<any> {
    return this.http.delete(
      `${environment.apiUrl}/api/anotaciones`
    );
  }
}
