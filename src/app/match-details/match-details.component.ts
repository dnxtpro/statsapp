import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatchService } from '../services/match.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { StorageService } from '../_services/storage.service';
import { Router } from '@angular/router';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
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
  isLoggedIn = false;
  showAdminBoard = false;
  showModeratorBoard = false;
  roles: string[] = [];
  username?: string;

  constructor(
    private route: ActivatedRoute,
    private matchService: MatchService,
    public dialog: MatDialog,
    private router: Router,
    private storageService:StorageService,
  ) {
    this.matchId = +this.route.snapshot.params['id'];
  }

  ngOnInit() {
    this.fetchPreviousMatches();
    
    this.isLoggedIn = this.storageService.isLoggedIn();
    if (this.isLoggedIn) {
      const user = this.storageService.getUser();
      this.roles = user.roles;

      this.showAdminBoard = this.roles.includes('ROLE_ADMIN');
      this.showModeratorBoard = this.roles.includes('ROLE_ENTRENADOR');

      this.username = user.username;
    }
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

  onCheckboxChange(event: MatButtonToggleChange) {
    const selectedTeams = event.value;
    this.selectedTeams = selectedTeams;
    this.filterByTeams();
  }

  deleteMatch(matchId: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent,{ width: '350px',});

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.matchService.deleteMatch(matchId).subscribe({
          next: (response) => {
            console.log('Respuesta:', response);
            this.fetchPreviousMatches();  // Actualizar la lista de partidos después de eliminar
          },
          error: (error) => console.error('Error:', error),
        });
        console.log('deleteMatch llamado con matchId:', matchId);
      }
    });
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