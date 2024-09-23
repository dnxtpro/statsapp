// src/app/services/fault-type.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable,throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';
import { map } from 'rxjs/operators';
interface positions{
  dorsal:string;
  position: number;
  player_id: number;
  }

@Injectable({
  providedIn: 'root'
})
export class FaultTypeService {
  private baseUrl = 'http://localhost:4001/'; // Reemplaza con la URL de tu backend

  constructor(private http: HttpClient) { }

  getFaultTypes(): Observable<any[]> {
    console.log(environment.apiUrl)
    return this.http.get<any[]>(`${environment.apiUrl}/api/faulttypes/all`);
  }
  getPosiciones(): Observable<positions[]> {
    console.log(environment.apiUrl)
    return this.http.get<positions[]>(`${environment.apiUrl}/api/positions2`)
      .pipe(
        map(data => {console.log('Fetched positions data:', data); // Log the fetched data
        return data as positions[];})
        
      );
  }
  updatePlayerPositions(positions: any[]) {
    console.log(environment.apiUrl)
    return this.http.patch<any>(`${environment.apiUrl}/api/positions1`, positions);
  }
}
