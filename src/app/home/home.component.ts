// home.component.ts

import { Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../_services/user.service';
import { StorageService } from '../_services/storage.service';
import { MatchService } from '../services/match.service';
import { trigger, transition, style, animate } from '@angular/animations';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }), // Estado inicial
        animate('750ms', style({ opacity: 1 })) // Animación
      ])
    ]),
    trigger('fadedIn', [
      transition(':enter', [
        style({ opacity: 0 }), // Estado inicial
        animate('500ms 500ms', style({ opacity: 1 })) // Animación
      ])
    ])
  ]
})
export class HomeComponent implements OnInit {
  matches: any[] = []; 
  content?: string;
  isLoggedIn:any;
  currentUser:any;
  resumentemporada:any[]=[];
  resumentemporada1:any[]=[];
  resumentemporada2:any[]=[];
  aciertos:any[]=[];
  fallos:any[]=[];
  aciertos1:any[]=[];
  fallos1:any[]=[];
  chartData: any[] = [];
  
  pieChartData: any[] = [];
  pieChartData2: any[] = [];

 

  constructor(private matchService:MatchService, private router: Router,private userService:UserService,private storageService:StorageService) {}
  ngOnInit(): void {
    this.matchService.resumenTemporada().subscribe(
      data => {
        console.log('Datos recibidos:', data);
        this.resumentemporada=data
      },
      error => {
        console.error('Error al obtener los datos:', error);
      }
    );
    this.matchService.resumenTemporadaPorFallos().subscribe(
      data => {
        console.log('Datos recibidos:', data);
        this.resumentemporada1=data;
        this.separarEvento(data);
      },
      error => {
        console.error('Error al obtener los datos:', error);
      }
    );
    this.matchService.resumenTemporadaPorPartido().subscribe(
      data => {
        console.log('Datos recibidos:', data);
        this.resumentemporada2=data;
        this.separarEvento2(data);
      },
      error => {
        console.error('Error al obtener los datos:', error);
      }
    );

    this.currentUser = this.storageService.getUser();
    this.isLoggedIn = this.storageService.isLoggedIn();
    this.userService.getAllUsers().subscribe(
      {
        next: data => {
           console.log(data)
           
        },
        error: err => {console.log(err)

        }
      }

    )
    
    this.userService.getPublicContent().subscribe({
      next: data => {
        this.content = data;
      },
      error: err => {console.log(err)
        if (err.error) {
          this.content = JSON.parse(err.error).message;
        } else {
          this.content = "Error with status: " + err.status;
        }
      }
    });
    
  }
sidebarAbierto = false;

toggleSidebar() {
  console.log('h')
  this.sidebarAbierto = !this.sidebarAbierto;
}
separarEvento(data: any[]) {
  console.log('Datos a separar:', data); // Verifica la estructura del array

  // Filtra los objetos con isSuccess = 1
  this.aciertos = data.filter(item => item.isSuccess === 1);
  // Filtra los objetos con isSuccess = 0
  this.fallos = data.filter(item => item.isSuccess === 0);

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

  data.forEach(item => {
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
        groupedFallos[date].value= item.count_isSuccess; // Asignar valor
      }
    }
  });

  // Crear los datos del gráfico en el formato requerido por ngx-charts
  this.chartData = [
    {
      name: 'Aciertos',
      series: Object.values(groupedAciertos) // Series para Aciertos
    },
    {
      name: 'Fallos',
      series: Object.values(groupedFallos) // Series para Fallos
    }
  ];

  console.log('Datos para el gráfico:', this.chartData);
}

formatYAxisTicks(value: number): string {
  return value.toString(); // Puedes formatear los ticks del eje Y si lo necesitas
}
generarPieChartData(data:any[]) {
  this.pieChartData = data.map(data => ({
    name: data.type,  // El nombre del tipo de evento
    value: data.event_count  // El valor es la cantidad de eventos
  }));

  console.log('Datos para el gráfico de torta:', this.pieChartData);
}
generarPieChartData2(data:any[]) {
  this.pieChartData2 = data.map(data => ({
    name: data.type,  // El nombre del tipo de evento
    value: data.event_count  // El valor es la cantidad de eventos
  }));

  console.log('Datos para el gráfico de torta:', this.pieChartData2);
}
}
