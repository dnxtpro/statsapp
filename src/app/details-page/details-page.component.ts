import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatchService } from '../services/match.service';
import { Match } from '../models/match.model';
import { Player } from '../models/player.model';
import { PlayerService } from '../services/player.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { colorSets } from '@swimlane/ngx-charts';
import { trigger, transition, style, animate } from '@angular/animations';
import * as XLSX from 'xlsx';
import { HttpClient } from '@angular/common/http';
import * as Excel from 'exceljs';
import { StorageService } from '../_services/storage.service';

interface Saque{
  tieneSaque: string;
  aciertos_count:number;
}

interface Resume {
  eventId: number;
  event_count: number;
  isSuccess: boolean;
  player_name: string;
  type: string;
}
interface Jugador {
  name: string;
  aciertos: number;
  fallos: number;
  porcentajeNegativo: string;
  porcentajePositivo: string;
  eficaciaPositiva: string;
  eficaciaNegativa: string;
}

@Component({
  selector: 'app-details-page',
  templateUrl: './details-page.component.html',
  styleUrls: ['./details-page.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }), // Estado inicial
        animate('750ms', style({ opacity: 1 })), // Animación
      ]),
    ]),
    trigger('fadedIn', [
      transition(':enter', [
        style({ opacity: 0 }), // Estado inicial
        animate('500ms 500ms', style({ opacity: 1 })), // Animación
      ]),
    ]),
  ],
})
export class DetailsPageComponent implements OnInit {
  currentUser: any;
  columnasAciertos: string[] = [
    'Ataque',
    'Saque',
    'Zaguero',
    'Finta',
    'Bloqueo',
    'ErrorSaqueRival',
    'ErrorAtqueRival',
    'EXRival',
  ];
  columnasFallos: string[] = [
    'FalloAtaque',
    'FalloSaque',
    'Gorro',
    'Recepcion',
    'EX',
    'AciertoRival',
    'AciertoZagueroRival',
    'AciertoFintaRival',
  ];
  resultadosPorJugador: Jugador[] = [];
  activeEntries: any[] = [];
  colorScheme: any;
  colorScheme2: any;
  colorScheme3: any;
  pieChartData: any[] = [];
  cambiarColoR() {
    if (this.currentView == 'aciertos') {
      this.colorScheme2 = {
        domain: ['#2C7C2F'], // Colores personalizados
      };
    } else {
      this.colorScheme2 = {
        domain: ['#FF0000'], // Colores personalizados
      };
    }
  }
  formatYAxisTicks(value: number): string {
    // Esto asegura que los ticks se muestren en intervalos de 10
    return value % 1 === 0 ? value.toString() : '';
  }

  currentSetIndex = 0;

  // Helper function to prepare sheet data based on selected columns
  convertObjectToArray(obj: any): any[] {
    return Object.keys(obj).map((key) => obj[key]);
  }
  chartData: any[] = [];
  dataCombinados: any[] = [];
  dataAciertos: any[] = [];
  dataFallos: any[] = [];
  currentView: string = 'aciertos';
  prepararDatosAciertos() {
    this.dataAciertos = this.resultadosPorJugador.map((jugador) => ({
      name: jugador.name,
      value: jugador.aciertos,
    }));
    return this.dataAciertos;
  }
  prepararDatosFallos() {
    this.dataFallos = this.resultadosPorJugador.map((jugador) => ({
      name: jugador.name,
      value: jugador.fallos,
    }));
    return this.dataFallos;
  }
  prepararDatosCombinados() {
    this.prepararDatosAciertos(); // Prepare aciertos data first
    this.prepararDatosFallos(); // Prepare fallos data

    this.dataCombinados = this.resultadosPorJugador.map((jugador) => ({
      name: jugador.name,
      series: [
        {
          name: 'aciertos',
          value:
            this.dataAciertos.find((dato) => dato.name === jugador.name)
              ?.value || 0,
        },
        {
          name: 'fallos',
          value:
            this.dataFallos.find((dato) => dato.name === jugador.name)?.value ||
            0,
        },
      ],
    }));
    return this.dataCombinados;
  }

  changeView(view: string): void {
    this.currentView = view;
    if (view === 'aciertos') {
      this.chartData = this.dataAciertos;
      console.log(this.chartData);
    } else if (view === 'fallos') {
      this.chartData = this.dataFallos;
      console.log(this.chartData);
    } else if (view === 'combinado') {
      this.chartData = this.dataCombinados;
      console.log(this.dataCombinados, 'combined');
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
  selectedSet: any;
  playerResume: any[] = [];
  sets: number[] = [];
  loadedTemplateData: ArrayBuffer | undefined = undefined;
  detalles: any[] = [];
  eficaciaSaque: Saque[] = [];
  eficaciaSaqueChartData: any[] = []; // <-- Añade esta propiedad para la gráfica

  constructor(
    private matchService: MatchService,
    private playerService: PlayerService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private storageService: StorageService,
  ) {
    this.sets = Array(5)
      .fill(0)
      .map((x, i) => i + 1);
  }
  selectSet(setNum: number) {
    this.selectedSet = this.setsData.find((set) => set.setNumber === setNum);
  }
  showSet(setNumber: number): void {
    // Función para mostrar el set especificado
    this.selectedSet = this.setsData.find((set) => set.setNumber === setNumber);
  }
  previousSet(): void {
    // Función para mostrar el set anterior
    const currentIndex = this.setsData.findIndex(
      (set) => set.setNumber === this.selectedSet.setNumber
    );
    if (currentIndex > 0) {
      this.selectedSet = this.setsData[currentIndex - 1];
    }
  }

  async loadTemplate(): Promise<void> {
    const templatePath = 'assets/plantilla1.xlsx';
    try {
      const response = await this.http
        .get(templatePath, { responseType: 'arraybuffer' })
        .toPromise();
      this.loadedTemplateData = response;
      console.log('Plantilla cargada correctamente');
    } catch (error) {
      console.error('Error al cargar la plantilla:', error);
    }
  }
  async addDataToTemplate(): Promise<void> {
    if (!this.loadedTemplateData) {
      console.error('Primero debes cargar la plantilla.');
      return;
    }

    // Cargar la plantilla como workbook
    const workbook = new Excel.Workbook();
    await workbook.xlsx.load(this.loadedTemplateData);

    // Obtener los datos de los sets (puede haber más o menos de 5 sets)

    // Obtener la hoja 'CVR36'
    const sheetCVR36 = workbook.getWorksheet('CVR36'); // Asegúrate de que 'CVR36' sea el nombre correcto de la hoja
    const fecha = new Date(this.detalles[0].date);
    const formatoFecha = fecha
      .toLocaleDateString('es-ES')
      .replace(/\//g, '-'); // Reemplazamos '/' por '-'

    // Construir el nombre del archivo dinámicamente
    const nombreArchivo = `${this.detalles[0].rivalTeam}_${formatoFecha}.xlsx`;
    if (sheetCVR36) {
      const sets = this.setsData; // Asumimos que setsData es un array de sets

      let playerNames = Object.keys(sets[0].data);
      // Ordenar playerNames para que "RIVAL" esté al final
      playerNames = playerNames.sort((a, b) => (a === 'Rival' ? 1 : b === 'Rival' ? -1 : 0));
      const detalles = this.detalles;
      const numSets = sets.length; // Número de sets disponibles
      // Calcular las filas dinámicas para los bloques de nombres
      let rowIndex1 = 10; // Fila donde comienza el primer bloque de nombres

      // Primero asignamos los nombres en el primer bloque

      // Columnas para cada tipo de dato
      const columns = {
        dorsal: ['A'],
        saque: ['C', 'M', 'W', 'AG', 'AQ'],
        ataque: ['D', 'N', 'X', 'AH', 'AR'],
        zaguero: ['E', 'O', 'Y', 'AI', 'AS'],
        finta: ['F', 'P', 'Z', 'AJ', 'AT'],
        bloqueo: ['G', 'Q', 'AA', 'AK', 'AU'],
        errorSaqueRival: ['H', 'R', 'AB', 'AL', 'AV'],
        errorAtaqueRival: ['I', 'S', 'AC', 'AM', 'AW'],
        exRival: ['J', 'T', 'AD', 'AN', 'AX'],
      };

      // Fila donde comienza el primer jugador
      let rowIndex = 10;

      sheetCVR36.getCell('I4').value = new Date(
        detalles[0].date
      ).toLocaleDateString('es-ES');
      sheetCVR36.getCell('I6').value = detalles[0].rivalTeam;
      sheetCVR36.getCell('N4').value = detalles[0].location;

     


      playerNames.forEach((playerName, index) => {
        // Para la primera sección, asignamos el nombre en la columna B
        const rowIndex = rowIndex1 + index;
        sheetCVR36.getCell(`B${rowIndex}`).value = playerName;

        // Obtener las estadísticas del jugador para todos los sets
        const playerStats = sets.map((set) => set.data[playerName]);

        // Asignar las estadísticas en las columnas correspondientes para este jugador
        for (let setIndex = 0; setIndex < numSets; setIndex++) {
          const setData = playerStats[setIndex]; // Datos de estadísticas del jugador para este set
          console.log(setData);

          if (columns.dorsal[setIndex]) {
            sheetCVR36.getCell(`${columns.dorsal[setIndex]}${rowIndex}`).value =
              setData.dorsal || 0;
          }

          if (columns.saque[setIndex]) {
            sheetCVR36.getCell(`${columns.saque[setIndex]}${rowIndex}`).value =
              setData.Saque || 0;
          }

          // Agregar Ataque en las columnas D, N, X, AH, AR (si el set existe)
          if (columns.ataque[setIndex]) {
            sheetCVR36.getCell(`${columns.ataque[setIndex]}${rowIndex}`).value =
              setData.Ataque || 0;
          }

          // Agregar Zaguero en las columnas E, O, Y, AI, AS (si el set existe)
          if (columns.zaguero[setIndex]) {
            sheetCVR36.getCell(
              `${columns.zaguero[setIndex]}${rowIndex}`
            ).value = setData.Zaguero || 0;
          }

          // Agregar Finta en las columnas F, P, Z, AJ, AT (si el set existe)
          if (columns.finta[setIndex]) {
            sheetCVR36.getCell(`${columns.finta[setIndex]}${rowIndex}`).value =
              setData.Finta || 0;
          }

          // Agregar Bloqueo en las columnas G, Q, AA, AK, AU (si el set existe)
          if (columns.bloqueo[setIndex]) {
            sheetCVR36.getCell(
              `${columns.bloqueo[setIndex]}${rowIndex}`
            ).value = setData.Bloqueo || 0;
          }

          // Agregar Error Saque Rival en las columnas H, R, AB, AL, AV (si el set existe)
          if (columns.errorSaqueRival[setIndex]) {
            sheetCVR36.getCell(
              `${columns.errorSaqueRival[setIndex]}${rowIndex}`
            ).value = setData.ErrorSaqueRival || 0;
          }

          // Agregar Error Ataque Rival en las columnas I, S, AC, AM, AW (si el set existe)
          if (columns.errorAtaqueRival[setIndex]) {
            sheetCVR36.getCell(
              `${columns.errorAtaqueRival[setIndex]}${rowIndex}`
            ).value = setData.ErrorAtaqueRival || 0;
          }

          // Agregar Ex Rival en las columnas J, T, AD, AN, AX (si el set existe)
          if (columns.exRival[setIndex]) {
            sheetCVR36.getCell(
              `${columns.exRival[setIndex]}${rowIndex}`
            ).value = setData.EXRival || 0;
          }
        }
      });

      // Después de procesar todos los jugadores, dejar 5 filas vacías
      let lastPlayerRow = rowIndex1 + playerNames.length;
      rowIndex1 = lastPlayerRow + 5;

      // Ahora repetimos el proceso desde la fila B33
      playerNames.forEach((playerName, index) => {
        const rowIndex = 33 + index;
       

        const playerStats = sets.map((set) => set.data[playerName]);

        for (let setIndex = 0; setIndex < numSets; setIndex++) {
          const setData = playerStats[setIndex];


          if (columns.saque[setIndex]) {
            if (columns.saque[setIndex]) {
              sheetCVR36.getCell(
                `${columns.saque[setIndex]}${rowIndex}`
              ).value = setData.FalloSaque || 0;
            }
          }

          if (columns.ataque[setIndex]) {
            sheetCVR36.getCell(`${columns.ataque[setIndex]}${rowIndex}`).value =
              setData.FalloAtaque || 0;
          }

          if (columns.zaguero[setIndex]) {
            if (columns.saque[setIndex]) {
              sheetCVR36.getCell(
                `${columns.zaguero[setIndex]}${rowIndex}`
              ).value = setData.Gorro || 0;
            }
          }

          if (columns.finta[setIndex]) {
            sheetCVR36.getCell(`${columns.finta[setIndex]}${rowIndex}`).value =
              setData.Recepcion || 0;
          }

          if (columns.bloqueo[setIndex]) {
            sheetCVR36.getCell(
              `${columns.bloqueo[setIndex]}${rowIndex}`
            ).value = setData.EX || 0;
          }

          if (columns.errorSaqueRival[setIndex]) {
            sheetCVR36.getCell(
              `${columns.errorSaqueRival[setIndex]}${rowIndex}`
            ).value = setData.AciertoRival || 0;
          }

          if (columns.errorAtaqueRival[setIndex]) {
            sheetCVR36.getCell(
              `${columns.errorAtaqueRival[setIndex]}${rowIndex}`
            ).value = setData.AciertoZagueroRival || 0;
          }

          if (columns.exRival[setIndex]) {
            sheetCVR36.getCell(
              `${columns.exRival[setIndex]}${rowIndex}`
            ).value = setData.AciertoFintaRival || 0;
          }
        }
      });
    }

    // Guardar el archivo modificado
    await this.saveWorkbook(workbook, nombreArchivo);
    console.log('Datos añadidos correctamente.');
  }

  async saveWorkbook(
    workbook: Excel.Workbook,
    filename: string
  ): Promise<void> {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    window.URL.revokeObjectURL(url);
    console.log(`Archivo guardado como ${filename}`);
  }

  nextSet(): void {
    // Función para mostrar el siguiente set
    const currentIndex = this.setsData.findIndex(
      (set) => set.setNumber === this.selectedSet.setNumber
    );
    if (currentIndex < this.setsData.length - 1) {
      this.selectedSet = this.setsData[currentIndex + 1];
    }
  }

  ngOnInit() {
    
    this.loadTemplate();
    this.matchId = +this.route.snapshot.params['id'];
    this.colorScheme = {
      domain: ['#2C7C2F', '#FF0000'], // Colores personalizados
    };
    this.colorScheme3 = {
    domain: ['#114a48', '#9c2e7b']
  };
    this.currentUser = this.storageService.getUser();
    // Mostrar inicialmente los aciertos
    this.chartData = this.dataAciertos;
    this.matchService
      .getServicePoints(this.matchId)
      .subscribe((points) => {
        this.eficaciaSaque = points;
        this.eficaciaSaqueChartData = this.prepararDatosEficaciaSaque(points);
        this.pieChartData = this.prepararDatosEficaciaSaque(points);
        console.log(this.eficaciaSaqueChartData, 'datos para gráfica eficacia saque');
      });
    this.matchService
      .getMatchDetailsByMatchId(this.matchId)
      .subscribe((partido) => {
        this.detalles = partido;
        console.log(this.detalles);

        this.playerService.getAllTeamPlayers(partido[0].equipoId).subscribe((players) => {
          console.log(players);
          this.players = players;
          this.matchService.getPlayerResume(this.matchId).subscribe((matches) => {
            this.playerResume = matches;
            this.resultadosPorJugador = this.contarFallosYAciertos(
              matches,
              this.players
            );
            this.prepararDatosAciertos();
            this.prepararDatosFallos();
            this.prepararDatosCombinados();
            this.changeView('combinado');
            this.colorScheme2 = {
              domain: ['#2C7C2F', '#FF0000'], // Colores personalizados
            };
            console.log(matches, 'resumen general');
          });
    
          // Llama a la función del servicio con el matchId
          this.matchService
            .getMatchEventsByMatchId(this.matchId)
            .subscribe((matches) => {
              this.matchDetails = matches;
              console.log(matches, 'partidos que he recibido');
              console.log(this.matchDetails, 'this.matchdetails');
    
              this.setsData = this.organizeDataBySets(
                this.matchDetails,
                this.players
              );
              this.showSet(1);
            });
        });
      });
    
  }
  contarFallosYAciertos(
    resumen: { player_name: string; isSuccess: number; event_count: number }[],
    players: { name: string }[]
  ): {
    name: string;
    aciertos: number;
    fallos: number;
    porcentajePositivo: string;
    porcentajeNegativo: string;
    eficaciaPositiva: string;
    eficaciaNegativa: string;
  }[] {
    const resultadosPorJugador: {
      name: string;
      aciertos: number;
      fallos: number;
      porcentajePositivo: string;
      porcentajeNegativo: string;
      eficaciaPositiva: string;
      eficaciaNegativa: string;
    }[] = [];

    // Inicializamos el arreglo con cada jugador
    players.forEach((player) => {
      resultadosPorJugador.push({
        name: player.name,
        aciertos: 0,
        fallos: 0,
        porcentajePositivo: '0.00',
        porcentajeNegativo: '0.00',
        eficaciaPositiva: '0.00',
        eficaciaNegativa: '0.00',
      });
    });

    // Recorremos el resumen para acumular aciertos y fallos usando event_count
    resumen.forEach((item) => {
      const { player_name, isSuccess, event_count } = item;
      const jugador = resultadosPorJugador.find((j) => j.name === player_name);

      if (jugador) {
        if (isSuccess === 1) {
          jugador.aciertos += event_count; // Sumamos los aciertos
        } else {
          jugador.fallos += event_count; // Sumamos los fallos
        }
      }
    });

    // Calculamos los porcentajes y eficacias
    const totalAciertos = resultadosPorJugador.reduce(
      (total, jugador) => total + jugador.aciertos,
      0
    );
    const totalFallos = resultadosPorJugador.reduce(
      (total, jugador) => total + jugador.fallos,
      0
    );

    resultadosPorJugador.forEach((jugador) => {
      const totalPos = jugador.aciertos + jugador.fallos;

      jugador.porcentajePositivo =
        totalAciertos > 0
          ? ((jugador.aciertos / totalAciertos) * 100).toFixed(2)
          : '0.00';
      jugador.porcentajeNegativo =
        totalFallos > 0
          ? ((jugador.fallos / totalFallos) * 100).toFixed(2)
          : '0.00';

      if (totalPos > 0) {
        jugador.eficaciaPositiva = (
          (jugador.aciertos / totalPos) *
          100
        ).toFixed(2);
        jugador.eficaciaNegativa = ((jugador.fallos / totalPos) * 100).toFixed(
          2
        );
      } else {
        jugador.eficaciaPositiva = '0.00';
        jugador.eficaciaNegativa = '0.00';
      }
    });

    return resultadosPorJugador;
  }

  organizeDataBySets(matchDetails: Match[], players: Player[]): any[] {
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
        players.forEach((player) => {
          setsData[setNumber - 1].data[player.name] = { dorsal: player.dorsal }; // Inicializar el jugador con un objeto vacío
        });
      }

      // Agregar el repetitionCount al jugador y faultTypeName correspondientes
      if (event.type) {
        setsData[setNumber - 1].data[event.player_name][event.type] =
          event.event_count;
      }
    });
    setsData.forEach((set) => {
      players.forEach((player) => {
        if (!set.data[player.name]) {
          set.data[player.name] = { dorsal: player.dorsal }; // Inicializar jugadores sin estadísticas con un objeto vacío
        }
      });
    });
    console.log('sets', setsData);
    return setsData;
  }
  onSelect(event: any): void {
    console.log('Selected:', event);
  }

  onActivate(event: any): void {
    this.activeEntries = [event];
  }

  onDeactivate(event: any): void {
    this.activeEntries = this.activeEntries.filter(
      (entry) => entry.name !== event.name
    );
  }

  getOpacity(entry: any): string {
    if (this.activeEntries.some((e) => e.name === entry.name)) {
      return '1'; // Opacidad completa cuando está activa
    } else {
      return '0.5'; // Opacidad reducida cuando no está activa
    }
  }
  // Función para obtener el playerName por.player_name

  // Añade esta función para estructurar los datos para la gráfica
  prepararDatosEficaciaSaque(points: Saque[]): any[] {
    return points.map(item => ({
      name: item.tieneSaque ? 'Saque' : 'Recepción',
      value: item.aciertos_count
    }));
    
  }
}
