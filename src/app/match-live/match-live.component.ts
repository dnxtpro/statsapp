import { Component, ChangeDetectorRef,OnInit,DoCheck,Input,OnChanges,SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatchService } from '../services/match.service';
import { FaultTypeService } from '../services/fault-type.service';
import { PlayerService } from '../services/player.service';
import { MatDialog } from '@angular/material/dialog';
import { PlayerModalComponent } from '../player-list-modal/player-list-modal.component';
import { Player } from '../models/player.model';
import { Observable } from 'rxjs';
import { ChoosePlayersComponent } from '../choose-players/choose-players.component';
import { SextetoComponent } from '../sexteto/sexteto.component';
import { BooleanService } from '../services/boolean.service';
import { QRCodeModule } from 'angularx-qrcode';
import { SoniaComponent } from '../sonia/sonia.component';



interface Eventos{
  
  tipofallo:string;
  player_name?: string;
  dorsal:number;
  puntosLocal:number;
  puntosVisitante:number;

}
interface positions{
dorsal:string;
position: number;
player_id: number;
}
interface SextetoPlayer {
  dorsal: string;
  position: number;
}
interface TeamScore {
  points: number;
  sets: number;
}

interface MatchScore {
  homeTeam: TeamScore;
  awayTeam: TeamScore;
  events: MatchEvent[];
}

interface MatchEvent {
  id:number;
  eventId:number;
  faultType: string;
  matchId: number;
  playerId: number;
  scoreLocal: number;
  scoreVisitor: number;
  setsLocal: number;
  setsVisitor: number;
  timestamp: string;
  actionType: string;
}




@Component({
  selector: 'app-match-live',
  templateUrl: './match-live.component.html',
  styleUrls: ['./match-live.component.css']
})
export class MatchLiveComponent implements OnInit,DoCheck {
  player_name:string|undefined;
  Eventos:any[]=[];
  latestMatchLocalscore=0;
  latestMatchLocalSets=0;
  latestMatchVisitorscore=0;
  latestMatchVisitorSets=0;
  match1Id=0;
  tieneSaque: boolean = true;
  previousTieneSaque: boolean=true;
  latestMatchId=0;
  latestMatchRival: string | undefined;
  latestMatchDate: Date | undefined;
  latestMatchLocation: string | undefined;
  selectedFaultType: string = '';
  matchScore: MatchScore = {
    homeTeam: { points: this.latestMatchLocalscore, sets: this.latestMatchLocalSets },   
    awayTeam: { points: this.latestMatchVisitorscore, sets:this. latestMatchVisitorSets},
    events: [],
  };
  registro:string='';
  selectedPlayers: SextetoPlayer[] = [{ dorsal: '0', position: 1 }, { dorsal: '0', position: 1 }, { dorsal: '0', position: 1 },{ dorsal: '0', position: 1}, { dorsal: '0', position: 1 }, { dorsal: '0', position: 1}];
  falloType: string = '';
  aciertoType: string = '';
  isPlayerListModalOpen = false;
  currentPlayers: Player[] = [];
  aciertos: any[] = [];
  fallos: any[] = [];
  positions: any[]=[];
  public qr:string='';
  constructor(
    private route: ActivatedRoute,
  private matchService: MatchService,
  private playerService: PlayerService,
  private faultTypeService: FaultTypeService,
  private dialog: MatDialog,
  private booleanService: BooleanService,
  private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadLatestMatchDetails();
    const storedTieneSaque = localStorage.getItem('tieneSaque');
  if (storedTieneSaque) {
    this.tieneSaque = JSON.parse(storedTieneSaque);
  }
    this.loadSexteto();
    
    setTimeout(() => {
      this.resetScores();
      this.ultimoseventosss();
      this.ultimoseventosss();
      },300);
      setTimeout(() => {
        this.ultimoseventosss();
        if(this.matchScore.homeTeam.points >= 25||this.matchScore.awayTeam.points >= 25){
          if((this.matchScore.homeTeam.points - this.matchScore.awayTeam.points)>=2){
            console.log('0-0 y 1 set para local')
            this.matchScore.awayTeam.points = 0;
            this.matchScore.homeTeam.points = 0;
            this.matchScore.homeTeam.sets +=1;
          }
          if((this.matchScore.awayTeam.points - this.matchScore.homeTeam.points)>=2){
            console.log('0-0 y 1 set para visitante')
          this.matchScore.awayTeam.points = 0;
          this.matchScore.homeTeam.points = 0;
          this.matchScore.awayTeam.sets +=1;
          }
          
        }
        },700);
      
  

   
  }
  ngDoCheck() {
    if (this.tieneSaque !== this.previousTieneSaque) {
      console.log('tieneSaque has changed!');
      this.previousTieneSaque = this.tieneSaque; // Update previous value
      this.changeDetector.detectChanges(); // Manually trigger change detection
      if(this.tieneSaque){
        this.rotarObjetos();
      }
      else(console.log('no tenemos saque'))
    }
      localStorage.setItem('tieneSaque', JSON.stringify(this.tieneSaque));
  }

  
  loadLatestMatchDetails() {

    this.matchService.getLatestMatchDetails().subscribe(
      (latestMatchDetails) => {
        console.log('Detalles del partido más reciente:', latestMatchDetails);
        // Aquí puedes asignar los detalles a las propiedades de tu componente
        this.latestMatchRival = latestMatchDetails.rivalTeam;
      this.latestMatchDate = latestMatchDetails.date;
      this.latestMatchLocation = latestMatchDetails.location;
      this.latestMatchId=latestMatchDetails.id;
      
      },
      (error) => {
        console.error('Error al obtener los detalles del partido más reciente:', error);
        // Manejar errores si es necesario
      }
    );
    this.matchService.getLatestMatchEvent().subscribe(
      (latestMatchEvent) => {
        console.log('Latest match event:', latestMatchEvent);
        this.matchScore.homeTeam.points= latestMatchEvent.scoreLocal;
        this.matchScore.homeTeam.sets= latestMatchEvent.setsLocal;
        this.matchScore.awayTeam.points= latestMatchEvent.scoreVisitor;
        this.matchScore.awayTeam.sets= latestMatchEvent.setsVisitor; 
        this.match1Id=latestMatchEvent.matchId;
        this.registro=latestMatchEvent.actionType;

        

      },
      (error) => {
        console.error('Error getting latest match event:', error);
        // Handle errors
      }
    );
    
    this.playerService.getAllPlayers().subscribe((players) => {
      console.log('Jugadores obtenidos:', players);
      this.currentPlayers = players;
      console.log('Jugadores obtenidos:', players);
    });

    // Cargar tipos de fallos y aciertos
    this.matchService.getFaultTypes().subscribe(
      (data) => {
        console.log('Tipos de fallo antes de mapear:', data);
        this.aciertos = data.successes;
        this.fallos = data.faults;
        console.log('Tipos de fallo:', this.aciertos,this.fallos);
        // Puedes asignar los resultados a una variable y mostrarlos en tu interfaz de usuario
      },
      (error) => {
        console.error('Error al obtener tipos de fallo:', error);
      }
    );
  }
  
  handleFallo(falloType: string): void {
    this.selectedFaultType = falloType;
    console.log('Fallo Type:', falloType);
    this.openPlayerModal('fallo',falloType);
  }
  
  handleAcierto(aciertoType: string): void {
    this.selectedFaultType = aciertoType;
    console.log('Acierto Type:', aciertoType);   
    this.openPlayerModal('acierto', aciertoType);
  }
  
  
  handleMatchEvent(actionType: string, player: Player, faultType: string,action:string) {
    const playerId = player.player_id;
    
    console.log('Nombre de la acción handle:', actionType)
    console.log('Detalles :', actionType,playerId,faultType);
    console.log('ID del jugador seleccionado:', playerId);
    console.log('Aciertos:', this.aciertos);
    console.log('Fallos:', this.fallos);
    if (faultType === undefined) {
      console.error('No se encontró el tipo de fallo/aciertos.');
      return;
    }
    
    const eventId = this.getEventTypeID(faultType,actionType); // Llama a la función para obtener el ID
    console.log('ID del EventType:', eventId);
    
    const timestamp: string = new Date().toISOString().slice(0, 19).replace('T', ' ');

  

    if (actionType=='acierto') {

      this.matchScore.homeTeam.points += 1; 
      this.tieneSaque=true;

    } else if (actionType=='fallo') {
     
      this.matchScore.awayTeam.points += 1; 
      this.tieneSaque=false;
      }
  
    if (this.checkSetWinner()) {
      if (this.matchScore.homeTeam.points > this.matchScore.awayTeam.points) {
        setTimeout(() => {
        this.matchScore.homeTeam.sets += 1;
        this.matchScore.homeTeam.points = 0;
        this.matchScore.awayTeam.points = 0;
        this.tieneSaque=true;
        this.selectedPlayers=[{ dorsal: '0', position: 1 }, { dorsal: '0', position: 1 }, { dorsal: '0', position: 1 },{ dorsal: '0', position: 1}, { dorsal: '0', position: 1 }, { dorsal: '0', position: 1}];
        },100);
      } else {
        setTimeout(() => {
          console.log('sexo')
        this.matchScore.awayTeam.sets += 1;
        this.matchScore.homeTeam.points = 0;
        this.matchScore.awayTeam.points = 0;
        this.tieneSaque=true;
        this.selectedPlayers=[{ dorsal: '0', position: 1 }, { dorsal: '0', position: 1 }, { dorsal: '0', position: 1 },{ dorsal: '0', position: 1}, { dorsal: '0', position: 1 }, { dorsal: '0', position: 1}];
      },100);
      }
      
    
      // Reiniciar los puntos después de ganar un set
    
    }
    const matchId:number=this.latestMatchId;

    const matchEventData: MatchEvent = {
      id:0,
      eventId:eventId!,
      matchId: matchId,
      faultType: faultType,
      actionType: actionType,
      playerId: playerId,
      scoreLocal: this.matchScore.homeTeam.points,
      scoreVisitor: this.matchScore.awayTeam.points,
      setsLocal: this.matchScore.homeTeam.sets,
      setsVisitor: this.matchScore.awayTeam.sets,
      timestamp: timestamp,
    };
    


   this.matchScore.events.push(matchEventData);

    
    console.log('envio al servidor:',eventId)
    if (eventId !== undefined) {
    this.matchService.saveMatchEvent(matchEventData, eventId).subscribe(
      
    (response) => {
      console.log('Evento del partido guardado con éxito', response);
    },
    (error) => {
      // Resto del código...
      console.error('Error al guardar el evento del partido:', error);
    }
    
  );
    } else {
      console.error('Unable to save match event. eventId is undefined.');
  }
  }

  checkSetWinner(): boolean {
    const homePoints = this.matchScore.homeTeam.points;
    const awayPoints = this.matchScore.awayTeam.points;
    const homeSets=this.matchScore.homeTeam.sets;
    const awaySets=this.matchScore.homeTeam.sets;
    if (homePoints >= 25 || awayPoints >= 25) {
      // Verificar la diferencia de puntos
      const pointDifference = Math.abs(homePoints - awayPoints);
  
      // Verificar si la diferencia es al menos 2 puntos
      if (pointDifference >= 2) {
        // Se ha ganado un set
        return true;
      }
    }
    return false;
  }
  checkGameWinner():boolean{
    const homeSets=this.matchScore.homeTeam.sets;
    const awaySets=this.matchScore.homeTeam.sets;
    if(homeSets>=3||awaySets>=3){
      return true;
    }
    return false;
  }

  getEventTypeID(faultType: string,actionType:string): number | undefined {
    // Busca el ID del eventType en tu arreglo de aciertos y fallos\
    console.log('id de fallos',this.aciertos,this.fallos,faultType)

    const aciertoso = this.aciertos.find(aciertoso => aciertoso.type === faultType && actionType === 'acierto');

    if (aciertoso) {
      console.log('id acierto',aciertoso.id)
      return aciertoso.id;
      
    } else {
      
      const falloso = this.fallos.find(falloso => falloso.type === faultType && actionType === 'fallo');

    if (falloso) {
      console.log('id fallo',falloso.id)
      return falloso.id;
      
    } else {
      console.error('No se encontró el ID del EventType para:', faultType);
      return undefined;
    }

    }
    
  }
  openPlayerChooseModal(): void {
    const dialogRef = this.dialog.open(ChoosePlayersComponent, {
      backdropClass: 'backdropBackground',
      width: '80%',
      height:'auto',
      data: {
        players: this.currentPlayers,
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
          const { player, data } = result; // Access the combined data
          const playerName = player.playerName;
          const playerId =player.player_id;
          const actionType=data.position;
         
      }
  });
}
openSonia():void{
  const dialogRef = this.dialog.open(SoniaComponent,{
    backdropClass: 'backdropBackground',
    width: 'auto',
    height:'auto',
  });
  dialogRef.afterClosed();
}
openSexteto():void{
  const dialogRef = this.dialog.open(SextetoComponent,{
    backdropClass: 'backdropBackground',
    width: 'auto',
    height:'auto',
    data: {
      players: this.currentPlayers,
      modalTitle: 'QUE PUTERO HA SIDO?',
    }
  });
  dialogRef.afterClosed().subscribe(result => {
    if (result) {
        this.selectedPlayers = result.selectedPlayers;
        this.tieneSaque=result.tieneSaque ;
        
   console.log(this.selectedPlayers,result.tieneSaque,result.jsonObject);
   this.pushData(result.selectedPlayers);
   this.qr=JSON.stringify(result.jsonObject);

    }
});
}
loadSexteto(){
  this.faultTypeService.getPosiciones().subscribe(
    (positions) => {
    this.selectedPlayers=positions;

      console.log('gola',this.selectedPlayers)
    },
    (error) => {
      console.error('Error al obtener tipos de fallo:', error);
    }
  );
}
rotarObjetos() {
  const primerObjeto = this.selectedPlayers.shift(); // Quita el primer objeto del array
  if (primerObjeto) {
    this.selectedPlayers.push(primerObjeto); // Añade el primer objeto al final del array
    // Actualiza las posiciones después de rotar
    this.selectedPlayers.forEach((objeto, index) => {
      objeto.position = index+1; // Corregido a 'position'
    });
    this.pushData(this.selectedPlayers); // Llama a la función para enviar los datos actualizados
  }
}

pushData(data: SextetoPlayer[]) {
  this.faultTypeService.updatePlayerPositions(data)
    .subscribe(
      (response) => {
        console.log('Posiciones de jugadores actualizadas con éxito', response);
        // Maneja cualquier acción adicional aquí, como actualizar la vista
      },
      (error) => {
        console.error('Error al actualizar posiciones de jugadores', error);
        // Maneja el error adecuadamente
      }
    );
}

handleRotations(){

console.log(this.positions,'mondongonfofofo')

  
}


  openPlayerModal(actionType: string, faultType: string): void {
    const dialogRef = this.dialog.open(PlayerModalComponent, {
      backdropClass: 'backdropBackground',
      width: '80%',
      height:'auto',
      data: {
        players: this.currentPlayers,
        modalTitle: 'QUE PUTERO HA SIDO?',
        actionType: actionType,
        faultType: faultType,  // Pasar el tipo de fallo
      }
    });
    
  
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
          const { player, data } = result; // Access the combined data
          const playerName = player.playerName;
          const playerId =player.player_id;
          const actionType=data.actionType;
          const faultType=data.faultType; 
          this.handleMatchEvent(actionType,player, faultType,playerName)
          console.log('modnongo',playerId,faultType,actionType)
              
    setTimeout(() => {
      
      this.ultimoseventosss();
      },200);
          
         
      }
  });
}
getLatestMatchEvent(): Observable<any> {
  return this.matchService.getLatestMatchEvent();
}
deleteLastMatchEvent() {
  
    this.matchService.deleteLastMatchEvent(this.match1Id).subscribe(
      (response) => {
        console.log('Evento eliminado con éxito:', response);
        // Manejar la respuesta del backend si es necesario
      },
      (error) => {
        console.error('Error al eliminar el evento:', error);
        // Manejar errores si es necesario
      },
      ()=>{
        this.loadLatestMatchDetails();
        this.resetScores();
        setTimeout(() => {
      
          this.ultimoseventosss();
          },200);
      }
    );
  }
  ultimoseventosss() {
    this.matchService.ultimoseventos(this.latestMatchId).subscribe(
      (Eventos) => {
        if (Eventos && Eventos.length > 0) {
          this.Eventos = Eventos;
          console.log('eventos recibidos:',this.Eventos)
        } else {
          console.log('No hay eventos recientes.');
        }
      }
    );
  }
resetScores(): void {
  console.log(this.match1Id,this.latestMatchId)
  if(this.match1Id!=this.latestMatchId){
    console.log('no coinciden')
  this.matchScore.homeTeam.points = 0;
  this.matchScore.homeTeam.sets = 0;
  this.matchScore.awayTeam.points = 0;
  this.matchScore.awayTeam.sets = 0;
  }
  else{console.log('si coinicden')}

  // Optionally reset other properties as needed, such as events array:
  this.matchScore.events = [];
}
}
