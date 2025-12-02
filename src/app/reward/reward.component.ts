import { Component, OnInit } from '@angular/core';
import { MatchService } from '../services/match.service';
import { PlayerService } from '../services/player.service';
import { MatDialog,MatDialogConfig } from '@angular/material/dialog';
import { DialogoRecompensaComponent } from '../dialogo-recompensa/dialogo-recompensa.component';

// Define an interface for the response from getPointsLog
interface PointsLogResponse {
  pointsLogs: PointsLog[]; // Array of points log entries
  totalPoints: number; // Total points
}

// Define an interface for a single points log entry
interface PointsLog {
  id: number;
  userId: number;
  points: number;
  reason: string;
  dateAwarded: string;
}

@Component({
  selector: 'app-reward',
  templateUrl: './reward.component.html',
  styleUrls: ['./reward.component.css'],
})
export class RewardComponent implements OnInit {
  rewards: any[] = [];
  pointsLogs: PointsLog[] = [];
  totalPoints: number = 0;
  players: any[] = [];

  constructor(
    private matchService: MatchService,
    private playerService: PlayerService,
    private MatDialog: MatDialog,
  ) {}

  ngOnInit() {
    this.matchService.getReward().subscribe((rewards) => {
      this.rewards = rewards;
      console.log('Rewards:', this.rewards);
    });

    this.matchService
      .getPointsLog()
      .subscribe((pointslog: PointsLogResponse) => {
        this.pointsLogs = pointslog.pointsLogs; // Access pointsLogs array
        this.totalPoints = pointslog.totalPoints; // Access totalPoints
        console.log('Points Logs:', this.pointsLogs);
        console.log('Total Points:', this.totalPoints);
      });
    this.playerService.getAllTeamPlayers(64).subscribe((players) => {
      this.players = players;
      console.log('Players:', this.players);
    });
  }
  onCanjear(reward: any) {
    console.log('Canjear:', reward);
    const dialogRef = this.MatDialog.open(DialogoRecompensaComponent, {
          backdropClass: 'backdropBackground',
          width: '90%',
          height: 'auto',
          data:reward,
        });
        dialogRef.afterClosed().subscribe((result) => {
     
          if(result !== undefined) {
            console.log('Dialog result:', result);
            this.matchService.redeemReward(result.id).subscribe((response) => {
              console.log('Response:', response);
              this.matchService
              .getPointsLog()
              .subscribe((pointslog: PointsLogResponse) => {
                this.pointsLogs = pointslog.pointsLogs; // Access pointsLogs array
                this.totalPoints = pointslog.totalPoints; // Access totalPoints
                console.log('Points Logs:', this.pointsLogs);
                console.log('Total Points:', this.totalPoints);
              });

            }
          );
          }
          
        });
    
  }
}