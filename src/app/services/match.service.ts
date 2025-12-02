import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Match, MatchEvent, MatchDetails } from '../models/match.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import { ModalService } from './modal-service.service';
import { PlayerService } from './player.service';
import { environment } from '../../environments/environment';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';
interface PointsLogResponse {
  pointsLogs: PointsLog[];  // Array of points log entries
  totalPoints: number;      // Total points
}
interface PointsLog {
  id: number;
  userId: number;
  points: number;
  reason: string;
  dateAwarded: string;
}

@Injectable({
  providedIn: 'root',
})
export class MatchService {
  // Lista de partidos, asegúrate de tener datos aquí
  private matches: Match[] = [];

  // Reemplaza con la URL de tu backend
  private apiUrl = 'http://localhost:4001/';

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private modalService: ModalService,
    private playerService: PlayerService
  ) {}

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
  getEvents() {
    return this.http.get<any[]>(`${environment.apiUrl}/events`);
  }
  getMarcador(): Observable<any[]> {
    console.log('hola');
    return this.http.get<any[]>(`${environment.apiUrl}/api/marcador`);
  }
  getReward(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/rewards`);
  }
  getPointsLog(): Observable<PointsLogResponse> {
    return this.http.get<PointsLogResponse>(`${environment.apiUrl}/api/pointslog`);
  }
  postPointLog(points:number,reason:string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/pointslog`,{points,reason});
  }
  postReward(rewardId:number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/rewards`,{rewardId});
  }

  getMatchDetails(): Observable<MatchDetails[]> {
    return this.http.get<MatchDetails[]>(
      `${environment.apiUrl}/api/partidos/user`
    );
  }
  getMatchEventsByMatchId(matchId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.apiUrl}/api/matchevent/${matchId}`
    );
  }
  getMatchDetailsByMatchId(matchId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.apiUrl}/api/matchevent2/${matchId}`
    );
  }
   getServicePoints(matchId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.apiUrl}/api/matchevent3/${matchId}`
    );
  }
  getPlayerResume(matchId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.apiUrl}/api/resumen/jugador/${matchId}`
    );
  }
  getLatestMatchDetails(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/latest-match-details`);
  }
  getLatestMatchEvent(): Observable<any> {
    const url = `${environment.apiUrl}/api/matchevents/getLatest`;
    return this.http.get(url);
  }
  deleteLastMatchEvent(matchId: number): Observable<any> {
    console.log(matchId, 'enviado');
    const url = `${environment.apiUrl}/api/matchevents/delete-last`;

    // Enviar el matchId al backend para borrar el último evento específico
    return this.http.delete(url, { params: { matchId: matchId.toString() } });
  }
  deleteMatch(matchId:number): Observable<any> {
    console.log(matchId, 'enviado');
   return this.http.delete(`${environment.apiUrl}/api/borrar-partido/${matchId}`);
  }
  editarEvento(id:number,currentEvent:any[]): Observable<any> {
   return this.http.put(`${environment.apiUrl}/api/matchevents/editar/${id}`,currentEvent);


  }
  postAnotaciones(annotationData:any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/matchevents/nueva/anotacion`,annotationData);
  }
  redeemReward(rewardId: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/rewards`, { rewardId });
  }

  getAnotaciones(matchId:number): Observable<any>{
    return this.http.get(`${environment.apiUrl}/api/matchevents/obtener/${matchId}`)
  }
  getPuntoxPunto(matchId:number): Observable<any>{
    return this.http.get(`${environment.apiUrl}/api/puntoxpunto/${matchId}`)
  }
  getMatchDetailsById(matchId: number): Observable<MatchDetails> {
    return this.http.get<MatchDetails>(
      `${environment.apiUrl}/api/partidos/${matchId}/details`
    );
  }
  sendMatchEvent(event: MatchEvent): Observable<any> {
    // Lógica para enviar el evento al backend
    return this.http.post<any>(
      `${environment.apiUrl}/api/send-match-event`,
      event
    );
  }
  ultimoseventos(match1Id: number): Observable<any> {
    console.log(match1Id);
    return this.http.get<any>(
      `${environment.apiUrl}/api/lastevents/${match1Id}`
    );
  }

  obtenerEquipos(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/getTeams`);
  }
  obtenerEquipos1(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/getTeams1`);
  }
  addTeam(team: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/api/team`, team);
  }
  createMatch(matchData: any): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}/api/partidos/user`,
      matchData
    );
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
  
  /**
   * Update the YouTube ID for a match on the backend.
   * PUT /api/partidos/:matchId/youtube
   */
  updateYoutubeId(matchId: number, youtubeId: string): Observable<any> {
    return this.http.put<any>(
      `${environment.apiUrl}/api/partidos/${matchId}/youtube`,
      { youtubeId }
    );
  }

  /**
   * Get the youtubeId for a match from the backend.
   * GET /api/partidos/:matchId/youtube
   */
  getYoutubeId(matchId: number): Observable<{ youtubeId: string | null }> {
    return this.http.get<{ youtubeId: string | null }>(
      `${environment.apiUrl}/api/partidos/${matchId}/youtube`
    );
  }

  

  resumenTemporada(): Observable<any> {
    // Reemplaza la implementación actual con una solicitud GET al backend por ID
    return this.http.get<any>(`${environment.apiUrl}/api/resumenTemporada`);
  }
  resumenTemporadaPorFallos(): Observable<any> {
    // Reemplaza la implementación actual con una solicitud GET al backend por ID
    return this.http.get<any>(
      `${environment.apiUrl}/api/resumenTemporadaPorFallos`
    );
  }
  resumenTemporadaPorPartido(): Observable<any> {
    // Reemplaza la implementación actual con una solicitud GET al backend por ID
    return this.http.get<any>(
      `${environment.apiUrl}/api/resumenTemporadaPorPartido`
    );
  }
  clasificacion(equipoId: any): Observable<any> {
    console.log(equipoId);
    return this.http.get<any>(
      `${environment.apiUrl}/api/clasificacion/${equipoId}`
    );
  }
  sincronizarPartido(matchId: number): Observable<any> {
    console.log(matchId);
    return this.http.put<any>(`${environment.apiUrl}/api/partidos/${matchId}/matchevent/lastRequest`, null);
  }    

  saveMatchEvent(matchEventData: MatchEvent, eventId: number,conSaque: boolean): Observable<any> {
    const payload = {
      matchEventData,
      conSaque,
    };

    return this.http.post<any>(
      `${environment.apiUrl}/api/matchevent/user`,
      payload
    );
  }
  handleMatchEvent(event: Match & MatchEvent) {
    this.sendMatchEvent(event).subscribe(
      (response) => {
        // Manejar la respuesta del backend si es necesario
        // Aquí puedes abrir la ventana modal con los detalles del jugador si la respuesta lo permite
        if (event.playerPoints && event.playerPoints.length > 0) {
          event.playerPoints.forEach((playerPoint) => {
            // Obtener información del jugador
            this.playerService
              .getPlayerByNumber(playerPoint.playerNumber)
              .subscribe(
                (player) => {
                  const playerInfo = {
                    player_id: player.player_id,
                    name: player.name,
                    dorsal: player.dorsal,
                    positionId: player.positionId,
                    position_name: player.position_name,
                    equipoId: player.equipoId,
                  };
                  this.modalService.openPlayerModal([playerInfo]);
                },
                (error) => {
                  console.error(
                    'Error al obtener información del jugador:',
                    error
                  );
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
  getActionTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/actions`); 
  }
  getSaques(matchId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/actions/saque/${matchId}`); 
  }
  getReces(matchId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/actions/rece/${matchId}`); 
  }
  getAtaques(matchId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/actions/ataque/${matchId}`); 
  }
  getColocaciones(matchId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/actions/colocaciones/${matchId}`); 
  }
  postActionRegister(actionData:any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/api/actions`,actionData);
  } 
  
}
