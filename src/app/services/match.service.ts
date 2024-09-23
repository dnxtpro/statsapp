import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Match,MatchEvent,MatchDetails } from '../models/match.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import { ModalService } from './modal-service.service';
import { PlayerService } from './player.service';
import { environment } from '../../environments/environment';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';

@Injectable({
  providedIn: 'root',
})
export class MatchService {
  // Lista de partidos, asegúrate de tener datos aquí
  private matches: Match[] = [];

  // Reemplaza con la URL de tu backend
  private apiUrl = 'http://localhost:4001/';
  

  constructor(private http: HttpClient,private dialog: MatDialog,private modalService: ModalService,private playerService: PlayerService) {}
  getFaultTypes(): Observable<any> {
  return this.http.get<any>(`${environment.apiUrl}/api/faulttypes/all`).pipe(
    map((data) => {
      console.log('Datos obtenidos:', data);

      // Filtrar tipos de fallo y aciertos según la propiedad isSuccess
      const successes: any[] = data.filter((item: any) => {
        
        return item.isSuccess === 1;
      });

      const faults: any[] = data.filter((item: any) => {
  
        return item.isSuccess === 0;
      });

    

      return { successes, faults };
    })
  );
}

getMarcador(): Observable<any[]>{
  console.log('hola');
  return this.http.get<any[]>(`${environment.apiUrl}/api/marcador`);
}
getMatchDetails(): Observable<MatchDetails[]> {
  return this.http.get<MatchDetails[]>(`${environment.apiUrl}/api/partidos/user`);
}
getMatchEventsByMatchId(matchId: number): Observable<any[]> {
  return this.http.get<any[]>(`${environment.apiUrl}/api/matchevent/${matchId}`);
}
getPlayerResume(matchId:number): Observable<any[]>{
  return this.http.get<any[]>(`${environment.apiUrl}/api/resumen/jugador/${matchId}`);
}
  getLatestMatchDetails(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/latest-match-details`);
  }
  getLatestMatchEvent(): Observable<any> {
    const url = `${environment.apiUrl}/api/matchevents/getLatest`;
    return this.http.get(url);
  }
  deleteLastMatchEvent(matchId: number): Observable<any> {
    console.log(matchId,'enviado')
    const url = `${environment.apiUrl}/api/matchevents/delete-last`;

    // Enviar el matchId al backend para borrar el último evento específico
    return this.http.delete(url, { params: { matchId: matchId.toString() } });
  }
  sendMatchEvent(event: MatchEvent): Observable<any> {
    // Lógica para enviar el evento al backend
    return this.http.post<any>(`${environment.apiUrl}/api/send-match-event`, event);
  }
  ultimoseventos(match1Id:number): Observable<any>{
    console.log(match1Id)
return this.http.get<any>(`${environment.apiUrl}/api/lastevents/${match1Id}`);
  }
  
obtenerEquipos():Observable<any>{
  return this.http.get<any>(`${environment.apiUrl}/api/getTeams`)
}
addTeam(team:any): Observable<any>{
  return this.http.post<any>(`${environment.apiUrl}/api/team`, team);
}
  createMatch(matchData: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/api/partidos/user`, matchData);
  } 
  getLatestMatch(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/latest-match`);
  }
  
  getMatches(): Observable<Match[]> {
    // Reemplaza la implementación actual con una solicitud GET al backend
    return this.http.get<Match[]>(`${environment.apiUrl}/api/partido`);
  }

  getMatchById(id: number): Observable<Match> {
    // Reemplaza la implementación actual con una solicitud GET al backend por ID
    return this.http.get<Match>(`${environment.apiUrl}/${id}`);
  }
  resumenTemporada(): Observable<any> {
    // Reemplaza la implementación actual con una solicitud GET al backend por ID
    return this.http.get<any>(`${environment.apiUrl}/api/resumenTemporada`);
  }
  resumenTemporadaPorFallos(): Observable<any> {
    // Reemplaza la implementación actual con una solicitud GET al backend por ID
    return this.http.get<any>(`${environment.apiUrl}/api/resumenTemporadaPorFallos`);
  }
  resumenTemporadaPorPartido(): Observable<any> {
    // Reemplaza la implementación actual con una solicitud GET al backend por ID
    return this.http.get<any>(`${environment.apiUrl}/api/resumenTemporadaPorPartido`);
  }
  saveMatchEvent(matchEventData: MatchEvent, eventId: number): Observable<any> {
      const payload = {
      matchEventData,
    };
  
   return this.http.post<any>(`${environment.apiUrl}/api/matchevent/user`, payload);
  }
  handleMatchEvent(event: Match & MatchEvent) {
    this.sendMatchEvent(event).subscribe(
      (response) => {
        // Manejar la respuesta del backend si es necesario
        // Aquí puedes abrir la ventana modal con los detalles del jugador si la respuesta lo permite
        if (event.playerPoints && event.playerPoints.length > 0) {
          event.playerPoints.forEach((playerPoint) => {
            // Obtener información del jugador
            this.playerService.getPlayerByNumber(playerPoint.playerNumber).subscribe(
              (player) => {
                const playerInfo = {
                  player_id: player.player_id,
                  name: player.name,
                  dorsal: player.dorsal,
                  positionId: player.positionId,
                  position_name: player.position_name, 
                  equipoId:player.equipoId 
                };
                this.modalService.openPlayerModal([playerInfo]);
              },
              (error) => {
                console.error('Error al obtener información del jugador:', error);
              }
            );
          });
        }
      },
      (error) => {
        console.error('Error al enviar el evento al backend:', error);
        // Manejar errores si es necesario
      }
    );
  }
}

  

  // Otros métodos para gestionar la lista de partidos
