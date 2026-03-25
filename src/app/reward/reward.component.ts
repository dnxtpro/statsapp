import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatchService } from '../services/match.service';
import { PlayerService } from '../services/player.service';
import { MatDialog,MatDialogConfig } from '@angular/material/dialog';
import { DialogoRecompensaComponent } from '../dialogo-recompensa/dialogo-recompensa.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
export class RewardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
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
    this.matchService.getReward().pipe(takeUntil(this.destroy$)).subscribe((rewards) => {
      this.rewards = rewards;
      console.log('Rewards:', this.rewards);
    });

    this.matchService
      .getPointsLog()
      .pipe(takeUntil(this.destroy$))
      .subscribe((pointslog: PointsLogResponse) => {
        this.pointsLogs = pointslog.pointsLogs; // Access pointsLogs array
        this.totalPoints = pointslog.totalPoints; // Access totalPoints
        console.log('Points Logs:', this.pointsLogs);
        console.log('Total Points:', this.totalPoints);
      });
    this.playerService.getAllTeamPlayers(64).pipe(takeUntil(this.destroy$)).subscribe((players) => {
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
        dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
     
          if(result !== undefined) {
            console.log('Dialog result:', result);
            this.matchService.redeemReward(result.id).pipe(takeUntil(this.destroy$)).subscribe((response) => {
              console.log('Response:', response);
              this.matchService
              .getPointsLog()
              .pipe(takeUntil(this.destroy$))
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}