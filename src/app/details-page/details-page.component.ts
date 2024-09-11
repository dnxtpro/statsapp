import { Component, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatchService } from '../services/match.service';
import { Match } from '../models/match.model';
import { Player } from '../models/player.model';
import { PlayerService } from '../services/player.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { colorSets } from '@swimlane/ngx-charts';
import * as XLSX from 'xlsx';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle
} from "ng-apexcharts";

interface Resume {
  eventId: number;
  event_count: number;
  isSuccess: boolean;
  player_name: string;
  type: string;
}
interface Jugador{
  name:string,
  aciertos:number,
  fallos:number,
  porcentajeNegativo:string,
  porcentajePositivo:string;
  eficaciaPositiva:string;
  eficaciaNegativa:string;
}


@Component({
  selector: 'app-details-page',
  templateUrl: './details-page.component.html',
  styleUrls: ['./details-page.component.css'],
})
export class DetailsPageComponent implements OnInit {

  columnasAciertos: string[] = ['Ataque', 'Saque', 'Zaguero', 'Finta', 'Bloqueo', 'ErrorSaqueRival', 'ErrorAtqueRival', 'EXRival'];
  columnasFallos: string[] = ['FalloAtaque', 'FalloSaque', 'Gorro', 'Recepcion', 'EX', 'AciertoRival', 'AciertoZagueroRival', 'AciertoFintaRival'];
resultadosPorJugador:Jugador[]=[];
activeEntries: any[] = [];
colorScheme: any;
colorScheme2: any;
cambiarColoR(){
  if(this.currentView=='aciertos'){
    this.colorScheme2 = {
      domain: ['#2C7C2F'] // Colores personalizados
    };
  }
    else{
      this.colorScheme2 = {
        domain: ['#FF0000'] // Colores personalizados
      };
    }
  
}
  exportarExcel() {
    
    const workbook = XLSX.utils.book_new();
    
    this.setsData.forEach((set, index) => {
      // Create a worksheet for aciertos
      const aciertosSheetData = this.prepareSheetData(set.data, this.columnasAciertos);
      const aciertosSheet = XLSX.utils.json_to_sheet(aciertosSheetData);
      XLSX.utils.book_append_sheet(workbook, aciertosSheet, `Aciertos_Set${index + 1}`);

      // Create a worksheet for fallos
      const fallosSheetData = this.prepareSheetData(set.data, this.columnasFallos);
      const fallosSheet = XLSX.utils.json_to_sheet(fallosSheetData);
      XLSX.utils.book_append_sheet(workbook, fallosSheet, `Fallos_Set${index + 1}`);
    });

    // Save the Excel file
    XLSX.writeFile(workbook, 'exportacion_datos.xlsx');
  }
  formatYAxisTicks(value: number): string {
    // Esto asegura que los ticks se muestren en intervalos de 10
    return value % 1 === 0 ? value.toString() : '';
  }
   
    currentSetIndex = 0;

    // Helper function to prepare sheet data based on selected columns
    prepareSheetData(data: any, columns: string[]): any[] {
      const sheetData = [];
  
      for (const player_name of Object.keys(data)) {
        const row: { [key: string]: any } = { 'Player': player_name || 'Nombre Desconocido' };
  
        columns.forEach(column => {
          row[column] = data[player_name]?.[column] || 0;
        });
  
        sheetData.push(row);
      }
      
      return sheetData;
    }
   convertObjectToArray(obj: any): any[] {
    return Object.keys(obj).map(key => obj[key]);
  }
  chartData: any[] = [];
  dataCombinados: any[] = [];
  dataAciertos:any[]=[];
  dataFallos:any[]=[];
  currentView: string = 'aciertos';
  prepararDatosAciertos() {
    this.dataAciertos = this.resultadosPorJugador.map(jugador => ({
      name: jugador.name,
      value: jugador.aciertos
    }));
    return this.dataAciertos;
  }
  prepararDatosFallos() {
    this.dataFallos = this.resultadosPorJugador.map(jugador => ({
      name: jugador.name,
      value: jugador.fallos
    }));
    return this.dataFallos;
  }
  prepararDatosCombinados(){
    this.prepararDatosAciertos(); // Prepare aciertos data first
    this.prepararDatosFallos();  // Prepare fallos data
  
    this.dataCombinados= this.resultadosPorJugador.map(jugador=>({
      name:jugador.name,
      series:[{
        name:"aciertos",
        value: this.dataAciertos.find(dato => dato.name === jugador.name)?.value || 0
      },{
        name:"fallos",
        value: this.dataFallos.find(dato => dato.name === jugador.name)?.value || 0
      }]
    }))
    return this.dataCombinados; 
  }

  changeView(view: string): void {
    this.currentView = view;
    if (view === 'aciertos') {
      this.chartData = this.dataAciertos;
      console.log(this.chartData)
    } else if (view === 'fallos') {
      this.chartData = this.dataFallos;
      console.log(this.chartData)
    } else if (view === 'combinado') {
      this.chartData = this.dataCombinados;
      console.log(this.dataCombinados,'combined')
    }
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }
  tablaId = 'stats';
  matchId!: number;
  matchDetails: Match[] = [];
  players: Player[] = [];
  setsData: any[] = [];
  playerData: any[] = []; 
  selectedSet:any;
  playerResume:any[]=[];
  

  constructor(
    private matchService: MatchService,
    private playerService: PlayerService,
    private route: ActivatedRoute,
   
  ) {}
  selectSet(setNum: number) {
    this.selectedSet = this.setsData.find(set => set.setNumber === setNum);
  }
  showSet(setNumber: number): void {
    // Función para mostrar el set especificado
    this.selectedSet = this.setsData.find(set => set.setNumber === setNumber);
  }
  previousSet(): void {
    // Función para mostrar el set anterior
    const currentIndex = this.setsData.findIndex(set => set.setNumber === this.selectedSet.setNumber);
    if (currentIndex > 0) {
      this.selectedSet = this.setsData[currentIndex - 1];
    }
  }
  nextSet(): void {
    // Función para mostrar el siguiente set
    const currentIndex = this.setsData.findIndex(set => set.setNumber === this.selectedSet.setNumber);
    if (currentIndex < this.setsData.length - 1) {
      this.selectedSet = this.setsData[currentIndex + 1];
    }
  }

  
  ngOnInit() {
    console.log(this.resultadosPorJugador)
    this.matchId = +this.route.snapshot.params['id'];
    this.colorScheme = {
      domain: ['#2C7C2F','#FF0000'] // Colores personalizados
    };
    // Mostrar inicialmente los aciertos
    this.chartData = this.dataAciertos;
  
    // Obtener la lista de jugadores usando PlayerService
    this.playerService.getAllPlayers().subscribe((players) => {
      this.players = players;
      this.matchService.getPlayerResume(this.matchId).subscribe((matches)=>{
        this.playerResume=matches;
        this.resultadosPorJugador = this.contarFallosYAciertos(matches, this.players);
        this.prepararDatosAciertos(); 
        this.prepararDatosFallos(); 
        this.prepararDatosCombinados();
        this.changeView('combinado');
        this.colorScheme2={
          domain: ['#2C7C2F','#FF0000'] // Colores personalizados
        }
        console.log(matches,'resumen general');
      })

      // Llama a la función del servicio con el matchId
      this.matchService.getMatchEventsByMatchId(this.matchId).subscribe((matches) => {
        this.matchDetails = matches;
        console.log(matches,'partidos que he recibido');
console.log(this.matchDetails,'this.matchdetails')
        
        this.setsData = this.organizeDataBySets(this.matchDetails);
        this.showSet(1);
      });
    });
    
    
   

  }

   contarFallosYAciertos(resumen: Resume[],players:Player[]): { name:string,aciertos: number; fallos: number,porcentajePositivo:string,porcentajeNegativo:string,eficaciaPositiva:string,eficaciaNegativa:string }[] {
    const resultadosPorJugador : {name:string, aciertos: number; fallos: number,porcentajePositivo:string,porcentajeNegativo:string,eficaciaPositiva:string,eficaciaNegativa:string }[] = [];
  players.forEach(player=>{
    resultadosPorJugador.push({
      name:player.name,
      aciertos:0,
      fallos:0,
      porcentajePositivo:"0,00",
      porcentajeNegativo:"0,00",
      eficaciaPositiva:"0,00",
      eficaciaNegativa:"0,00", 
    })
  });
    resumen.forEach(item => {
      const { player_name, isSuccess } = item;
      const jugador =resultadosPorJugador.find(j => j.name === player_name);
      if(jugador){
        jugador[isSuccess?'aciertos':'fallos']++;
      }
    });
    const totalAciertos = resultadosPorJugador.reduce((total, jugador) => total + jugador.aciertos, 0);
    const totalFallos = resultadosPorJugador.reduce((total, jugador) => total + jugador.fallos, 0);
    resultadosPorJugador.forEach(jugador => {
      jugador.porcentajePositivo = totalAciertos > 0 ? ((jugador.aciertos / totalAciertos) * 100).toFixed(2) : '0.00';
      jugador.porcentajeNegativo = totalFallos > 0 ? ((jugador.fallos / totalFallos) * 100).toFixed(2) : '0.00';
    
      const totalPos= jugador.aciertos + jugador.fallos;
      if (totalPos > 0) {
        jugador.eficaciaPositiva = ((jugador.aciertos / totalPos) * 100).toFixed(2);
        jugador.eficaciaNegativa = ((jugador.fallos / totalPos) * 100).toFixed(2);
      } else {
        jugador.eficaciaPositiva = '0.00';
        jugador.eficaciaNegativa = '0.00';
      }
    });
   

  console.log(resultadosPorJugador,'antes')
  return resultadosPorJugador;
  }

  organizeDataBySets(matchDetails: Match[]): any[] {
    const setsData: any[] = [];

    // Iterar sobre los detalles del partido y organizar por sets
    matchDetails.forEach((event) => {
      const setNumber = event.total_sets;
      
      // Crear un objeto para el set si aún no existe
      if (!setsData[setNumber - 1]) {
        setsData[setNumber - 1] = {
          setNumber,
          data: {},
        };
      }

      // Crear un objeto para el jugador si aún no existe
      if (!setsData[setNumber - 1].data[event.player_name]) {
        setsData[setNumber - 1].data[event.player_name] = {};
      }

      // Agregar el repetitionCount al jugador y faultTypeName correspondientes
      if (event.type) {
        setsData[setNumber - 1].data[event.player_name][event.type] = event.event_count;
      }
    });
    console.log('sets',setsData)
    return setsData;
  }
  onSelect(event: any): void {
    console.log('Selected:', event);
  }

  onActivate(event: any): void {
    this.activeEntries = [event];
  }

  onDeactivate(event: any): void {
    this.activeEntries = this.activeEntries.filter(entry => entry.name !== event.name);
  }
  
  getOpacity(entry: any): string {
    if (this.activeEntries.some(e => e.name === entry.name)) {
      return '1'; // Opacidad completa cuando está activa
    } else {
      return '0.5'; // Opacidad reducida cuando no está activa
    }
  }
  // Función para obtener el playerName por.player_name
  
}
