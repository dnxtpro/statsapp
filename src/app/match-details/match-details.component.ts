import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatchService } from '../services/match.service';

@Component({
  selector: 'app-match-details',
  templateUrl: './match-details.component.html',
  styleUrls: ['./match-details.component.css'],
})
export class MatchDetailsComponent implements OnInit {

  matchId!: number;
  previousMatches: any[] = [];
  groupedData: { [key: string]: any[] } = {};
  filteredData: { [key: string]: any[] } = {};
  selectedTeams: string[] = [];
  teamKeys: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private matchService: MatchService
  ) {
    this.matchId = +this.route.snapshot.params['id'];
  }

  ngOnInit() {
    this.fetchPreviousMatches();
  }

  // Método para agrupar por 'parequi.nombre'
  groupByParequi(arr: any[], key: string): { [key: string]: any[] } {
    return arr.reduce((acc, item) => {
      const groupKey = this.resolveKey(item, key);
      
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      
      acc[groupKey].push(item);
      return acc;
    }, {} as { [key: string]: any[] });
  }

  // Utilidad para acceder a propiedades anidadas
  resolveKey(obj: any, key: string): string {
    return key.split('.').reduce((o, k) => (o ? o[k] : null), obj) || '';
  }
  onCheckboxChange(event: any) {
    const checkbox = event.target;
    const team = checkbox.value;
    
    if (checkbox.checked) {
      this.selectedTeams.push(team);
    } else {
      this.selectedTeams = this.selectedTeams.filter(t => t !== team);
    }

    this.filterByTeams();
  }

  // Llamada para obtener los detalles de los partidos anteriores
  fetchPreviousMatches() {
    this.matchService.getMatchDetails().subscribe(matches => {
      this.previousMatches = matches;
      console.log('Detalles del partido más reciente:', matches);
      
      // Agrupar los datos después de haberlos obtenido
      this.groupedData = this.groupByParequi(this.previousMatches, 'parequi.nombre');
      this.teamKeys = Object.keys(this.groupedData);
      console.log('Datos agrupados:', this.groupedData);
      this.filteredData = { ...this.groupedData };
    });
  }

  // Filtrar los datos por equipos seleccionados
  filterByTeams() {
    if (this.selectedTeams.length === 0) {
      // Si no hay equipos seleccionados, mostramos todos
      this.filteredData = { ...this.groupedData };
    } else {
      // Filtrar según los equipos seleccionados
      this.filteredData = Object.keys(this.groupedData)
        .filter(key => this.selectedTeams.includes(key))
        .reduce((acc, key) => {
          acc[key] = this.groupedData[key];
          return acc;
        }, {} as { [key: string]: any[] });
    }
  }
}
