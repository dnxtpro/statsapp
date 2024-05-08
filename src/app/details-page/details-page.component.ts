import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatchService } from '../services/match.service';
import { Match } from '../models/match.model';
import { Player } from '../models/player.model';
import { PlayerService } from '../services/player.service';
import * as XLSX from 'xlsx';



@Component({
  selector: 'app-details-page',
  templateUrl: './details-page.component.html',
  styleUrls: ['./details-page.component.css'],
})
export class DetailsPageComponent implements OnInit {

  columnasAciertos: string[] = ['Ataque', 'Saque', 'Zaguero', 'Finta', 'Bloqueo', 'ErrorSaqueRival', 'ErrorAtqueRival', 'EXRival'];
  columnasFallos: string[] = ['FalloAtaque', 'FalloSaque', 'Gorro', 'Recepcion', 'EX', 'AciertoRival', 'AciertoZagueroRival', 'AciertoFintaRival'];
  
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
  

  constructor(
    private matchService: MatchService,
    private playerService: PlayerService,
    private route: ActivatedRoute
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
    
    this.matchId = +this.route.snapshot.params['id'];

    // Obtener la lista de jugadores usando PlayerService
    this.playerService.getAllPlayers().subscribe((players) => {
      this.players = players;
      

      // Llama a la función del servicio con el matchId
      this.matchService.getMatchEventsByMatchId(this.matchId).subscribe((matches) => {
        this.matchDetails = matches;
        console.log(matches);

        // Organizar los datos por sets
        this.setsData = this.organizeDataBySets(this.matchDetails);
      });
    });
    this.showSet(1);
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
  

  // Función para obtener el playerName por.player_name
  
}
