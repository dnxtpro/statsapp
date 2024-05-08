export interface Match {
    event_count: any;
    type: any;
    eventId: any;
    event_Count: any;
    player_name: any;
    total_sets: any;
    playerName: any;
    totalSets: any;
    id: number;
    teamVisitor: string;
    date: Date;
    location: string;
    pointsLocal: number;
    pointsVisitor: number;
    setsLocal: number;
    setsVisitor: number;
    playerPoints: PlayerPoint[];
    actionType:string;
    playerId:number;
    repetitionCount:number;
    faultTypeName:string;
    faultType:string;
    player_id:number;
  }
  
  export interface PlayerPoint {
    playerNumber: number;
    faultType: string;
    successType: string;
    isTeamLocal: boolean;
  }
  export interface MatchEvent {
    actionType: string;
    faultType: string;
    scoreLocal: number;
    scoreVisitor: number;
    setsLocal: number;
    setsVisitor: number;
    timestamp: string;
    playerId:number;
    
  }
  export interface MatchDetails{
  id: number;
  equipo_local: string; 
  rivalTeam: string; 
  date: Date;
  location: string;
  setsLocal: number;
    setsVisitor: number;

  }