import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatchService } from '../services/match.service';
import {MatchDetails} from '../models/match.model'

@Component({
  selector: 'app-match-details',
  templateUrl: './match-details.component.html',
  styleUrls: ['./match-details.component.css'],
})
export class MatchDetailsComponent {
  matchId!: number;
  previousMatches: MatchDetails[] = [];
   // Array to store previous matches

  constructor(
    private route: ActivatedRoute,
    private matchService: MatchService
  ) 
  
  {
    this.matchId = +this.route.snapshot.params['id'];
    this.fetchPreviousMatches();
  }

  match = this.matchService.getMatchById(this.matchId);

  fetchPreviousMatches() {
    this.matchService.getMatchDetails().subscribe(matches => {
      this.previousMatches = matches;
      console.log('Detalles del partido más reciente:',matches);
    });
  }
}
