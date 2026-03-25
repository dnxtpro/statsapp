/**
 * Editor Component Data Models
 * Interfaces for the video annotation and match detail editor
 */

/**
 * Match Details (from getMatchDetailsById)
 * Used to display match metadata in the editor
 */
export interface MatchDetails {
  id: number;
  date: Date;
  location: string;
  equipoId?: number;
  equipoNombre?: string;
  rivalTeam: string;
  rivalId?: number;
  pointsLocal?: number;
  pointsVisitor?: number;
  setsLocal?: number;
  setsVisitor?: number;
  youtubeId?: string | null;
  lastRequestAt?: string | number | null;
}

/**
 * Fault Type (from getFaultTypes)
 * Represents failure/success action classifications
 */
export interface FaultType {
  id: number;
  type?: string;
  name: string;
  isSuccess: 0 | 1; // 1 = success/acierto, 0 = fault/fallo
  description?: string;
}

/**
 * Fault Type Response (getFaultTypes returns this)
 * Separates successes from faults
 */
export interface FaultTypeResponse {
  successes: FaultType[];
  faults: FaultType[];
}

/**
 * Match Event (from getPuntoxPunto)
 * Represents a point-by-point event in a set
 */
export interface MatchEventDetail {
  id: number;
  eventId: number;
  matchId: number;
  playerId: number;
  team?: string;
  playerName?: string;
  dorsal?: number;
  faultType: string;
  faultTypeName?: string;
  scoreLocal: number;
  scoreVisitor: number;
  setsLocal: number;
  setsVisitor: number;
  timeStamp?: number;
  timestamp?: string;
  actionType?: string;
  isSuccess?: boolean;
  event: {
    type?: string;
    isSuccess: boolean;
  };
  player: {
    player_name: string;
  };
}

/**
 * Match Events by Set
 * getPuntoxPunto returns array of arrays (per set)
 */
export type MatchEventsBySet = MatchEventDetail[][];

/**
 * Score by Set (computed from match events)
 * Used for displaying scores per set
 */
export interface ScoreBySet {
  set: number;
  scores: Array<{
    scoreLocal: number;
    scoreVisitor: number;
    isSuccess: boolean;
  }>;
}

/**
 * Player (from getAllTeamPlayers)
 */
export interface Player {
  player_id: number;
  name: string;
  dorsal: number;
  positionId: number;
  position_name: string;
  equipoId: number;
}

/**
 * Action Rating (from getSaques, getReces, getAtaques, getColocaciones)
 * Represents a quality/rating of an action
 */
export type ActionRating = [number, string, string, string?];

/**
 * Canvas Annotation Backend Response
 * What the backend returns for getAnnotationsByMatch
 */
export interface CanvasAnnotationResponse {
  id?: number;
  annotation_id?: string;
  type: string;
  timestamp: number;
  visible: boolean;
  color?: string;
  opacity?: number;
  strokeWidth?: number;
  data?: any;
  description?: string;
  matchId?: number;
  createdAt?: string;
}

/**
 * Annotation Data (for saving new annotations)
 */
export interface AnnotationSavePayload {
  player_ids: number[];
  nombre: string;
  timestamp: number;
  eventId: number;
}

export interface PendingAnnotationPayload {
  annotation_id: string;
  type: string;
  timestamp: number;
  visible: boolean;
  color: string;
  opacity: number;
  strokeWidth?: number;
  data: any;
  source: string;
  matchId?: number;
  eventIndex?: number;
}

/**
 * Action Register Payload (for postActionRegister)
 */
export interface ActionRegisterPayload {
  player_id: number;
  rating_id: number;
  matchId: number;
  action_type_id: number;
  timestamp: number;
  teamId: number;
}

/**
 * Combined Data for Action Selection
 * Temporary storage during the action modal flow
 */
export interface CombinedActionData extends ActionRegisterPayload {
  // Extends the base payload, can add more fields if needed
}

/**
 * YouTube ID Response
 * What the backend returns for getYoutubeId
 */
export interface YoutubeIdResponse {
  youtubeId: string | null;
}

/**
 * Style object for popup positioning
 * Avoids strict index-signature issues with CSS positioning
 */
export interface PopupStyle {
  left?: string;
  top?: string;
  right?: string;
  bottom?: string;
  position?: string;
  zIndex?: string | number;
  [key: string]: any;
}
