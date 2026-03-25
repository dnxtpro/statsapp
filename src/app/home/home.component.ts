// home.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../_services/user.service';
import { StorageService } from '../_services/storage.service';
import { MatchService } from '../services/match.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { Form } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
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
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  events: any[] = [];
  upcomingEvents: any[] = [];
  equipos: any[] = [];
  matches: any[] = [];
  content?: string;
  isLoggedIn: any;
  currentUser: any;
  resumentemporada: any[] = [];
  resumentemporada1: any[] = [];
  resumentemporada2: any[] = [];
  aciertos: any[] = [];
  fallos: any[] = [];
  aciertos1: any[] = [];
  fallos1: any[] = [];
  chartData: any[] = [];
  clasificacion: any[] = [];

  pieChartData: any[] = [];
  pieChartData2: any[] = [];

  customColor: any = [];
  constructor(
    private matchService: MatchService,
    private router: Router,
    private userService: UserService,
    private storageService: StorageService,
    private http: HttpClient
  ) {}
  ngOnInit(): void {
    
    this.getUpcomingEvents();
    this.getclasification(10)
    this.matchService.resumenTemporada().pipe(takeUntil(this.destroy$)).subscribe(
      (data) => {
        console.log('Datos recibidos:', data);
        this.resumentemporada = data;
      },
      (error) => {
        console.error('Error al obtener los datos:', error);
      }
    );
    this.matchService.resumenTemporadaPorFallos().pipe(takeUntil(this.destroy$)).subscribe(
      (data) => {
        console.log('Datos recibidos:', data);
        this.resumentemporada1 = data;
        this.separarEvento(data);
      },
      (error) => {
        console.error('Error al obtener los datos:', error);
      }
    );
    this.matchService.resumenTemporadaPorPartido().pipe(takeUntil(this.destroy$)).subscribe(
      (data) => {
        console.log('Datos recibidos:', data);
        this.resumentemporada2 = data;
        this.separarEvento2(data);
      },
      (error) => {
        console.error('Error al obtener los datos:', error);
      }
    );
    this.matchService.obtenerEquipos().pipe(takeUntil(this.destroy$)).subscribe(
      (data) => {
        console.log('Datos recibidos:', data);
        this.equipos = data;
      },
      (error) => {
        console.error('Error al obtener los datos:', error);
      }
    );

    this.currentUser = this.storageService.getUser();
    this.isLoggedIn = this.storageService.isLoggedIn();
    this.userService.getAllUsers().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        console.log(data);
      },
      error: (err) => {
        console.log(err);
      },
    });

    this.userService.getPublicContent().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.content = data;
      },
      error: (err) => {
        console.log(err);
        if (err.error) {
          this.content = JSON.parse(err.error).message;
        } else {
          this.content = 'Error with status: ' + err.status;
        }
      },
    });
  }
  sidebarAbierto = false;

  toggleSidebar() {
    console.log('h');
    this.sidebarAbierto = !this.sidebarAbierto;
  }
  getclasification(equipoId: any) {
    this.matchService.clasificacion(equipoId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any[]) => {  // Definimos 'data' como un array de objetos
        this.clasificacion = data;
  
        const resultado = Object.values(data.reduce((acc: any, { player_name, isSuccess, coonta }) => {
          // Si no existe la entrada para el jugador, inicializamos
          if (!acc[player_name]) {
            acc[player_name] = { player_name, acierto: 0, fallo: 0 };
          }
          
          // Si el acierto es 1, sumamos 'coonta' a 'acierto', de lo contrario a 'fallo'
          if (isSuccess === 1) {
            acc[player_name].acierto += coonta;
          } else {
            acc[player_name].fallo += coonta;
          }
  
          return acc;
        }, {}));
  
        // Calcular la diferencia entre aciertos y fallos para cada jugador
        resultado.forEach((item: any) => {
          item.diferencia = item.acierto - item.fallo;
        });
        resultado.sort((a: any, b: any) => b.diferencia - a.diferencia);
        this.clasificacion = resultado;
        // Asignamos el resultado calculado a 'clasificacion' o donde lo necesites
        console.log(resultado);  // Mostramos el resultado en consola (o asignamos a un campo si es necesario)
  
      },
      error: (err) => {
        if (err.error) {
          this.clasificacion = JSON.parse(err.error).message;
        }
      },
    });
  }
  
  getUpcomingEvents() {
    this.matchService.getEvents().pipe(takeUntil(this.destroy$)).subscribe((events: any[]) => {
      // Aquí indicamos el tipo de 'events'
      this.events = events;
      console.log(events)
      this.filterCurrentWeekEvents();
      
    });
    console.log(this.events);
  }


  separarEvento(data: any[]) {
    console.log('Datos a separar:', data); // Verifica la estructura del array

    // Filtra los objetos con isSuccess = 1
    this.aciertos = data.filter((item) => item.isSuccess === 1);
    // Filtra los objetos con isSuccess = 0
    this.fallos = data.filter((item) => item.isSuccess === 0);

    // Muestra los resultados en la consola
    console.log('Aciertos:', this.aciertos);
    console.log('Fallos:', this.fallos);
    this.generarPieChartData(this.fallos);
    this.generarPieChartData2(this.aciertos);
  }
  separarEvento2(data: any[]) {
    console.log('Datos a separar:', data); // Verifica la estructura del array

    // Inicializar las estructuras para agrupar los datos de Aciertos y Fallos
    const groupedAciertos: any = {};
    const groupedFallos: any = {};

    data.forEach((item) => {
      const date = new Date(item.date).toLocaleDateString(); // Formatear la fecha

      // Agrupar Aciertos
      if (item.isSuccess === 1) {
        if (!groupedAciertos[date]) {
          groupedAciertos[date] = { name: date, value: item.count_isSuccess };
        } else {
          groupedAciertos[date].value = item.count_isSuccess; // Asignar valor
        }
      }
      // Agrupar Fallos
      else if (item.isSuccess === 0) {
        if (!groupedFallos[date]) {
          groupedFallos[date] = { name: date, value: item.count_isSuccess };
        } else {
          groupedFallos[date].value = item.count_isSuccess; // Asignar valor
        }
      }
    });

    // Crear los datos del gráfico en el formato requerido por ngx-charts
    this.chartData = [
      {
        name: 'Aciertos',
        series: Object.values(groupedAciertos), // Series para Aciertos
      },
      {
        name: 'Fallos',
        series: Object.values(groupedFallos), // Series para Fallos
      },
    ];

    console.log('Datos para el gráfico:', this.chartData);
  }
  customColors = [
    {
      name: "Aciertos",
      value: "#008f39" // Verde
    },
    {
      name: "Fallos",
      value: "#ff0000" // Rojo
    }
  ];

  formatYAxisTicks(value: number): string {
    return value.toString(); // Puedes formatear los ticks del eje Y si lo necesitas
  }
  generarPieChartData(data: any[]) {
    this.pieChartData = data.map((data) => ({
      name: data.type, // El nombre del tipo de evento
      value: data.event_count, // El valor es la cantidad de eventos
    }));

    console.log('Datos para el gráfico de torta:', this.pieChartData);
  }
  generarPieChartData2(data: any[]) {
    this.pieChartData2 = data.map((data) => ({
      name: data.type, // El nombre del tipo de evento
      value: data.event_count, // El valor es la cantidad de eventos
    }));

    console.log('Datos para el gráfico de torta:', this.pieChartData2);
  }
  filterCurrentWeekEvents() {
    const now = new Date();
    const startOfWeek = this.getStartOfWeek(now);
    const endOfWeek = this.getEndOfWeek(now);

    // Filtra eventos dentro de la semana actual
    const currentWeekEvents = this.events.filter(event => {
      const eventDate = new Date(event.start.dateTime);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    });

    // Si no hay eventos en la semana actual, muestra los siguientes
    if (currentWeekEvents.length === 0) {
      this.upcomingEvents = this.events.filter(event => new Date(event.start.dateTime) > now);
    } else {
      this.upcomingEvents = currentWeekEvents;
    }
  }

  // Obtener el inicio de la semana (lunes)
  getStartOfWeek(date: Date): Date {
    const startOfWeek = new Date(date);
    const day = date.getDay();
    const diff = date.getDate() - day + (day == 0 ? -6 : 1); // Ajuste para lunes
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  }
  

  // Obtener el final de la semana (domingo)
  getEndOfWeek(date: Date): Date {
    const endOfWeek = new Date(date);
    const day = date.getDay();
    const diff = date.getDate() - day + (day == 0 ? 0 : 7); // Ajuste para domingo
    endOfWeek.setDate(diff);
    endOfWeek.setHours(23, 59, 59, 999);
    return endOfWeek;
 
  }
  isEvenRow(row: any): boolean {
    const index = this.clasificacion.indexOf(row);
    return index % 2 === 0;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
