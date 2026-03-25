import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  HostListener,
} from '@angular/core';
import { MatchService } from '../services/match.service';
import { PlayerService } from '../services/player.service';
import { AnnotationService } from '../annotation.service';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from '../_services/storage.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { PlayerModalComponent } from '../player-list-modal/player-list-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { EvaluarComponent } from '../evaluar/evaluar.component';
import { ModalReceComponent } from '../modal-rece/modal-rece.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  MatchDetails,
  FaultType,
  FaultTypeResponse,
  MatchEventDetail,
  MatchEventsBySet,
  ScoreBySet,
  Player,
  ActionRating,
  CanvasAnnotationResponse,
  AnnotationSavePayload,
  PendingAnnotationPayload,
  ActionRegisterPayload,
  YoutubeIdResponse,
  PopupStyle,
} from '../models/editor.model';

export type AnnotationType =
  | 'pen'
  | 'line'
  | 'arrow'
  | 'rectangle'
  | 'circle'
  | 'text'
  | 'highlight'
  | 'eraser';

export interface Annotation {
  id: string;
  type: AnnotationType;
  timestamp: number;
  visible: boolean;
  data: any;
  color: string;
  opacity: number;
  strokeWidth?: number;
  dbId?: number; // Backend database ID for deletion
  description?: string; // optional brief description entered by the user
}

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '250ms cubic-bezier(.4,0,.2,1)',
          style({ opacity: 1, transform: 'none' })
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms cubic-bezier(.4,0,.2,1)',
          style({ opacity: 0, transform: 'translateY(-20px)' })
        ),
      ]),
    ]),
  ],
})
export class EditorComponent implements OnInit, OnDestroy {
  // ===== RxJS Memory Leak Prevention =====
  private destroy$ = new Subject<void>();

  // ===== Annotation Properties =====
  selectedTool: AnnotationType | 'select' | 'eraser' = 'select';
  color: string = '#3B82F6';
  strokeWidth: number = 2;
  opacity: number = 1.0;
  canUndo: boolean = false;
  canRedo: boolean = false;
  volume: number = 1.0;

  // lista que usamos en template para pasar al canvas y al listado
  anotaciones: Annotation[] = []; // asegúrate que esta sea la única fuente de verdad

  selectedAnnotationId: string | null = null;
  highlightedAnnotationId: string | null = null;
  // --- annotation description editor ---
  pendingAnnotationId: string | null = null; // id of last-created annotation waiting for description
  pendingAnnotationText: string = '';
  // Store prepared payloads for annotations that are pending backend creation
  pendingDbPayloads: { [id: string]: PendingAnnotationPayload } = {};
  currentTime1: number = 0;

  // ===== Match Event Properties =====
  eventos: MatchEventsBySet = [];
  currentSetIndex: number = 0;
  currentEventIndex: number = 0;
  currentEvent: any = {
    id: 0,
    eventId: 0,
    matchId: 0,
    playerId: 0,
    faultType: '',
    scoreLocal: 0,
    scoreVisitor: 0,
    setsLocal: 0,
    setsVisitor: 0,
    event: { isSuccess: false, type: '' },
    player: { player_name: '' },
  };

  // ===== Annotation Mode Properties =====
  anotacionMode = false;
  annotationText: string = '';
  filteredUsers: Player[] = [];
  mentionedUsers: Player[] = [];
  showAutocomplete = false;

  // ===== Action Type Properties =====
  saque: ActionRating[] = [];
  rece: ActionRating[] = [];
  ataque: ActionRating[] = [];
  colo: ActionRating[] = [];

  // ===== Fault Type Properties =====
  aciertos: FaultType[] = [];
  fallos: FaultType[] = [];

  // ===== Player & Match Data =====
  currentPlayers: Player[] = [];
  editMode = false;
  matchId: number = 0;
  scorBySet: ScoreBySet[] = [];
  selectedSetIndex: number = 0;
  selectedEventIndex: number = 0;
  // ===== UI/UX Properties =====
  imageMap: { [key: string]: string } = {
    Saque: '/voley/assets/saque.svg',
    Ataque: '/voley/assets/ataque.svg',
    Zaguero: '/voley/assets/ataquez.svg',
    Finta: '/voley/assets/finta.svg',
    Bloqueo: '/voley/assets/bloqueo.svg',
    Gorro: '/voley/assets/bloqueoX.svg',
    EX: '/voley/assets/clown.svg',
  };
  
  // ===== Authentication =====
  isLoggedIn = false;
  showAdminBoard = false;
  showModeratorBoard = false;
  roles: string[] = [];
  username?: string;

  // ===== ViewChild References =====
  @ViewChild('timelineRef', { static: false })
  timelineRef!: ElementRef<HTMLDivElement>;
  @ViewChild('playerContainer', { static: false })
  playerContainerRef!: ElementRef<HTMLDivElement>;

  // ===== Mouse/Video Timeline Properties =====
  hoveredTime: number | null = null;
  isDragging = false;

  // ===== YouTube Player Properties =====
  player: YT.Player | undefined;
  currentTime: number = 0;
  duration: number = 0;
  playbackRate: number = 0;
  currentPlaybackRate = 1;
  play = false;
  isFullScreen = false;
  isMuted: boolean = false;
  
  // ===== Video Quality Support =====
  availableQualities: string[] = [];
  currentQuality: string = '';

  // ===== Match Data Properties =====
  datosDePartido: MatchDetails | null = null;

  // ===== Event Monitor Internal State =====
  private _eventMonitor: NodeJS.Timeout | null = null;
  private _eventMonitorActive: boolean = false;
  private _lastCheckedTime: number | null = null;

  // ===== Layout & Navigation =====
  useRightOverlay: boolean = false;
  asidePinned: boolean = false;
  asideHovering: boolean = false;
  activeTab: 'editor' | 'resume' = 'editor';

  // ===== Action Map Toggles =====
  mapaRece: boolean = false;
  mapaSaque: boolean = false;
  mapaAtaque: boolean = false;
  mapaColocacion: boolean = false;

  // ===== YouTube ID Management =====
  youtubeId: string | null = null;
  showYoutubeInput: boolean = false;
  youtubeInput: string = '';

  // ===== Popup Positioning Styles =====
  pendingPopupStyle: PopupStyle | null = null;
  hoverPopupStyle: PopupStyle | null = null;
  hoverAnnotationId: string | null = null;
  hoverAnnotationDescription: string | null = null;

  // ===== Temporal References & Combined Data =====
  tiempoReferencia: number = 0;
  combinedData: ActionRegisterPayload[] = [];
  teamId: number = 0;
  setNumber: number = 0;
  
  constructor(
    private matchService: MatchService,
    private playerService: PlayerService,
    private annotationService: AnnotationService,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private dialog: MatDialog
  ) {}
  ngOnInit(): void {
    // determine initial layout based on screen orientation and width
    try {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isPortrait = h > w;
      if (isPortrait) {
        this.useRightOverlay = true; // vertical screens start with right overlay
      } else if (w > 1440) {
        this.useRightOverlay = false; // large horizontal screens: show left toolbar
      } else {
        this.useRightOverlay = true; // medium horizontal screens: start with right overlay
      }
      console.log(
        '[Editor] initial useRightOverlay ->',
        this.useRightOverlay,
        'window',
        w,
        'x',
        h
      );
    } catch (e) {
      // fallback to previous default
      console.warn(
        '[Editor] could not determine screen size for initial layout',
        e
      );
    }
    this.matchId = +this.route.snapshot.params['id'];

    this.matchService.getMatchDetailsById(this.matchId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((match: MatchDetails) => {
        this.datosDePartido = match;
        this.teamId = this.datosDePartido.equipoId ?? 0;
        console.log(this.datosDePartido, this.teamId);
        this.loadMatchData();

        // Check localStorage for a saved reference for this match and apply it
        try {
          const raw = localStorage.getItem('editor.lastSavedReference');
          if (raw) {
            const saved = JSON.parse(raw);
            if (saved && saved.matchId === this.matchId && saved.reference) {
              console.log('[Editor] Applying saved reference from localStorage for match', this.matchId);
              this.applySavedReference(saved.reference);
            }
          }
        } catch (e) {
          console.warn('[Editor] Failed to read saved reference from localStorage', e);
        }
      });
    // Fetch youtubeId for this match and decide whether to load the player or show input
    this.fetchYoutubeId();

    this.loadAnotaciones();
    console.log(this.matchId);
    this.matchService.getPuntoxPunto(this.matchId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((events: MatchEventsBySet) => {
        this.eventos = (events || []).map((set) =>
          (set || []).map((item) => this.normalizeEvent(item))
        );
        console.log('Detalles del partido más reciente:', events);
        this.loadCurrentEvent();
        this.scoreBySet();
      });
    this.loadActions();

    // Restore aside pinned state from localStorage
    try {
      const rawPinned = localStorage.getItem('editor.asidePinned');
      if (rawPinned !== null) {
        this.asidePinned = rawPinned === 'true';
      }
    } catch (e) {
      console.warn('[Editor] could not read aside pinned state', e);
    }

    // Start monitoring events against currentTime to show them near their timestamp
    this.startEventMonitor();

    this.isLoggedIn = this.storageService.isLoggedIn();
    if (this.isLoggedIn) {
      const user = this.storageService.getUser();
      this.roles = user.roles;

      this.showAdminBoard = this.roles.includes('ROLE_ADMIN');
      this.showModeratorBoard = this.roles.includes('ROLE_ENTRENADOR');

      this.username = user.username;
    }
  }

  // Layout toggles
  toggleRightOverlay() {
    this.useRightOverlay = !this.useRightOverlay;
    console.log('[Editor] useRightOverlay ->', this.useRightOverlay);
  }

  setUseRightOverlay(value: boolean) {
    this.useRightOverlay = !!value;
  }

  setActiveTab(tab: 'editor' | 'resume') {
    this.activeTab = tab;
  }

  // Aside hover handler (called from template)
  onAsideHover(isHovering: boolean) {
    this.asideHovering = !!isHovering;
  }

  // Toggle the pinned state and persist to localStorage
  toggleAsidePinned() {
    this.asidePinned = !this.asidePinned;
    try {
      localStorage.setItem('editor.asidePinned', this.asidePinned ? 'true' : 'false');
    } catch (e) {
      console.warn('[Editor] failed to persist asidePinned', e);
    }
  }

  // Utility used by template class binding
  isAsideCollapsed(): boolean {
    return !this.asidePinned && !this.asideHovering;
  }

  loadCurrentEvent(): void {
    if (
      this.eventos.length > 0 &&
      this.eventos[this.currentSetIndex].length > 0
    ) {
      this.currentEvent =
        this.eventos[this.currentSetIndex][this.currentEventIndex];
    } else {
      this.currentEvent = this.normalizeEvent({
        id: 0,
        eventId: 0,
        matchId: this.matchId,
        playerId: 0,
        faultType: '',
        scoreLocal: 0,
        scoreVisitor: 0,
        setsLocal: 0,
        setsVisitor: 0,
      });
    }
  }
  
  scoreBySet() {
    this.scorBySet = this.eventos.map((set: MatchEventDetail[], index: number) => ({
      set: index + 1,
      scores: set.map(
        (item: MatchEventDetail) => ({
          scoreLocal: item.scoreLocal,
          scoreVisitor: item.scoreVisitor,
          isSuccess: item.event?.isSuccess ?? item.isSuccess ?? false,
        })
      ),
    }));
    console.log(this.scorBySet, 'mola');
  }
  getImage(type: string): string {
    return this.imageMap[type] || '../../assets/default.svg'; // Imagen por defecto
  }

  loadAnotaciones() {
    // Cargar anotaciones de texto/menciones (antiguo sistema)
    this.matchService.getAnotaciones(this.matchId).subscribe((events) => {
      console.log('Anotaciones de texto:', events);
    });

    // Cargar anotaciones de canvas (nuevo sistema)
    this.loadCanvasAnnotations();
  }

  loadCanvasAnnotations() {
    this.annotationService.getAnnotationsByMatch(this.matchId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (canvasAnnotations: CanvasAnnotationResponse[]) => {
          // Mapear el formato backend al formato local del canvas
          this.anotaciones = canvasAnnotations.map((ann) => ({
            id: ann.annotation_id || `annotation-${ann.id}`,
            type: ann.type as AnnotationType,
            timestamp: ann.timestamp,
            visible: ann.visible,
            color: ann.color || '#3B82F6',
            opacity: ann.opacity ?? 1,
            strokeWidth: ann.strokeWidth,
            data: ann.data,
            description:
              ann.description ?? (ann.data && ann.data.description) ?? undefined,
            dbId: ann.id, // Store backend database ID for deletion
          }));
          console.log('[Editor] Canvas annotations loaded:', this.anotaciones);
        },
        (error) => {
          console.error('[Editor] Error loading canvas annotations:', error);
          this.anotaciones = [];
        }
      );
  }

  nextEvent(): void {
    // Guard: no eventos available
    if (!this.eventos || !Array.isArray(this.eventos) || this.eventos.length === 0) return;

    // Ensure current set exists
    if (!Array.isArray(this.eventos[this.currentSetIndex])) {
      // try to find the first non-empty set
      let firstNonEmpty = this.eventos.findIndex((s: any[]) => Array.isArray(s) && s.length > 0);
      if (firstNonEmpty >= 0) {
        this.currentSetIndex = firstNonEmpty;
        this.currentEventIndex = 0;
        this.selectedSetIndex = this.currentSetIndex;
        this.selectedEventIndex = this.currentEventIndex;
        this.loadCurrentEvent();
        this.scrollToTop();
      }
      return;
    }

    const currentSet = this.eventos[this.currentSetIndex] || [];
    const currentSetLength = currentSet.length;

    // If there are more events in the current set, advance the index
    if (this.currentEventIndex < currentSetLength - 1) {
      this.currentEventIndex++;
    } else {
      // Otherwise find the next non-empty set (if any)
      let nextSet = this.currentSetIndex + 1;
      while (nextSet < this.eventos.length && (!Array.isArray(this.eventos[nextSet]) || this.eventos[nextSet].length === 0)) {
        nextSet++;
      }

      if (nextSet < this.eventos.length) {
        console.log('[Editor] nextEvent: advancing to next set', {
          fromSet: this.currentSetIndex,
          fromIndex: this.currentEventIndex,
          toSet: nextSet,
        });
        this.currentSetIndex = nextSet;
        this.currentEventIndex = 0;
      } else {
        // no further events available; keep at end
        console.log('[Editor] nextEvent: no further non-empty sets found after', this.currentSetIndex);
        return;
      }
    }

    // keep selection state consistent
    this.selectedSetIndex = this.currentSetIndex;
    this.selectedEventIndex = this.currentEventIndex;

    this.loadCurrentEvent();
    this.scrollToTop();
  }

  onTextChange(event: Event): void {
    const inputElement = event.target as HTMLElement;
    const text = inputElement.innerHTML || '';
    this.annotationText = text;

    let showAutocomplete = false;
    let query = '';

    // Buscar la última ocurrencia de @ en cualquier parte del texto
    const atIndex = text.lastIndexOf('@');
    if (atIndex !== -1) {
      // Solo mostrar si después de @ no hay un espacio ni un span (es decir, está escribiendo una mención)
      const afterAt = text.substring(atIndex + 1);
      if (!afterAt.startsWith('<span') && !afterAt.startsWith(' ')) {
        const words = afterAt.split(/[\s<>&]/);
        query = words[0].toLowerCase();
        this.filteredUsers = this.currentPlayers.filter((user) =>
          user.name.toLowerCase().includes(query)
        );
        showAutocomplete = this.filteredUsers.length > 0 && query.length > 0;
      }
    }
    this.showAutocomplete = showAutocomplete;
  }
  selectUser(user: Player): void {
    const contentDiv = document.querySelector('.formatted-text') as HTMLElement;
    const text = contentDiv.innerHTML || '';
    const atIndex = text.lastIndexOf('@');

    if (atIndex !== -1) {
      // Obtener el texto antes y después de la mención
      const beforeAt = text.substring(0, atIndex);
      const afterAt = text
        .substring(atIndex)
        .split(/[\s<>&]/)
        .slice(1)
        .join(' ');

      // Crear el span para la mención
      const mentionSpan = `<span style="background-color: #d2eaff; color: blue; border-radius: 4px; padding: 2px 4px; display: inline-block;" class="tag-highlight">@${user.name}</span>&nbsp;`;

      // Actualizar el contenido del div
      contentDiv.innerHTML = beforeAt + mentionSpan + afterAt.replace(/^@/, '');
      // Limpiar saltos de línea innecesarios
      contentDiv.innerHTML = contentDiv.innerHTML.replace(/<br>/g, '');

      // Mover el cursor al final del contenido
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(contentDiv);
      range.collapse(false);
      if (sel !== null) {
        sel.removeAllRanges();
        sel.addRange(range);
      }

      // Actualizar estado
      this.mentionedUsers.push(user);
      this.annotationText = contentDiv.textContent || '';
      this.showAutocomplete = false;
      this.filteredUsers = [];
    }
  }
  
  addMention(user: Player): void {
    this.mentionedUsers.push(user);
    const words = this.annotationText.split(' ');
    words[words.length - 1] = `@${user.name}`;
    this.annotationText = words.join(' ') + ' ';
    this.showAutocomplete = false;
  }

  getFormattedAnnotation(): string {
    let formattedText = this.annotationText;
    this.mentionedUsers.forEach((user) => {
      const mentionTag = `@${user.name}`;
      const highlightedTag = `<span style="color:blue;">${mentionTag}</span>`;
      formattedText = formattedText.replace(
        new RegExp(`\\b${mentionTag}\\b`, 'g'),
        highlightedTag
      );
    });
    return formattedText;
  }

  saveAnnotation(): void {
    const annotation = this.annotationText;
    const mentions = this.mentionedUsers.map((user) => user.player_id);
    const currentTime = this.player?.getCurrentTime();
    const eventId = this.currentEvent?.id;

    console.log('Texto completo:', annotation, currentTime);
    console.log('Menciones separadas:', mentions);

    const annotationData: AnnotationSavePayload = {
      player_ids: mentions,
      nombre: annotation,
      timestamp: currentTime ?? 0,
      eventId: eventId ?? 0,
    };

    this.matchService.postAnotaciones(annotationData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          console.log('Anotación guardada con éxito:', response);
          this.loadAnotaciones();
        },
        (error) => {
          console.error('Error al guardar la anotación:', error);
        }
      );
  }

  scrollToTop() {
    console.log('scrolled');
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100); // Retardo de 100 ms
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }
  toggleAnotacionMode() {
    this.anotacionMode = !this.anotacionMode;
  }
  saveChanges() {
    this.editMode = false;
    console.log(this.currentEvent);
    const data = this.currentEvent;

    this.matchService.editarEvento(data?.id ?? 0, data as any)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response: any) => {
          console.log('Evento editado con éxito:', response);
          // Store reference + matchId in localStorage so we can reapply later
          try {
            const payload = {
              matchId: this.matchId,
              reference: response,
              savedAt: new Date().toISOString(),
            };
            localStorage.setItem('editor.lastSavedReference', JSON.stringify(payload));
            console.log('[Editor] Saved reference to localStorage', payload);
          } catch (e) {
            console.warn('[Editor] Could not save reference to localStorage', e);
          }

          this.matchService.getPuntoxPunto(this.matchId)
            .pipe(takeUntil(this.destroy$))
            .subscribe((events: MatchEventsBySet) => {
              this.eventos = (events || []).map((set) =>
                (set || []).map((item) => this.normalizeEvent(item))
              );
              console.log('Detalles del partido más reciente:', events);
              this.loadCurrentEvent();
              this.toggleAnotacionMode();
            });
        },
        (error: any) => {
          console.error('Error al editar el evento:', error);
        }
      );
  }
  previousEvent(): void {
    if (this.currentEventIndex > 0) {
      this.currentEventIndex--;
    } else if (this.currentSetIndex > 0) {
      this.currentSetIndex--;
      this.currentEventIndex = this.eventos[this.currentSetIndex].length - 1;
    }
    this.loadCurrentEvent();
  }
  loadMatchData() {
    this.playerService.getAllTeamPlayers(this.teamId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((players: Player[]) => {
        console.log('Jugadores obtenidos:', players);
        this.currentPlayers = players;
        console.log('Jugadores obtenidos:', players);
      });
    
    this.matchService.getFaultTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data: FaultTypeResponse) => {
          console.log('Tipos de fallo antes de mapear:', data);
          this.aciertos = data.successes;
          this.fallos = data.faults;
          console.log('Tipos de fallo:', this.aciertos, this.fallos);
        },
        (error) => {
          console.error('Error al obtener tipos de fallo:', error);
        }
      );
  }
  selectEvent(setIndex: number, eventIndex: number): void {
    this.currentSetIndex = setIndex;
    this.currentEventIndex = eventIndex;
    this.selectedSetIndex = setIndex;
    this.selectedEventIndex = eventIndex;
    this.loadCurrentEvent();
    this.scrollToTop();
  }
  openPlayerModal(id: number): void {
    let selectedAction: ActionRating[] = [];
    let selectedActionName: string = '';
    const typeId = Number(id);
    switch (typeId) {
      case 1:
        selectedAction = this.saque || [];
        selectedActionName = 'Saque';
        break;
      case 2:
        selectedAction = this.rece || [];
        selectedActionName = 'Recepción';
        break;
      case 3:
        selectedAction = this.ataque || [];
        selectedActionName = 'Ataque';
        break;
      case 4:
        selectedAction = this.colo || [];
        selectedActionName = 'Colocación';
        break;
      default:
        selectedAction = this.saque || [];
    }
    console.log(
      '[Editor] openPlayerModal selectedAction typeId=',
      typeId,
      'items=',
      selectedAction.length
    );
    const dialogRef = this.dialog.open(PlayerModalComponent, {
      backdropClass: 'backdropBackground',
      width: 'auto',
      height: 'auto',
      data: {
        players: this.currentPlayers,
        modalTitle: selectedActionName,
        allowKeyboard: true,
      },
    });
    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectedPlayer: any) => {
        if (selectedPlayer) {
          console.log('Jugador seleccionado:', selectedPlayer);
          const dialogRef2 = this.dialog.open(EvaluarComponent, {
            backdropClass: 'backdropBackground',
            width: 'auto',
            height: 'auto',
            data: {
              saque: selectedAction,
            },
          });
          dialogRef2.afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe((selectedRating: any) => {
              if (this.mapaRece && id === 2) {
                const dialogRef3 = this.dialog.open(ModalReceComponent, {
                  backdropClass: 'backdropBackground',
                  width: 'auto',
                  height: 'auto',
                });
                dialogRef3.afterClosed()
                  .pipe(takeUntil(this.destroy$))
                  .subscribe((mapaData: any) => {
                    console.log('Datos del mapa de recepción:', mapaData);
                  });
              }
              if (selectedRating) {
                console.log('Acción seleccionada:', selectedRating);
                const actionPayload: ActionRegisterPayload = {
                  player_id: selectedPlayer.player.player_id,
                  rating_id: selectedRating[0],
                  matchId: this.matchId,
                  action_type_id: id,
                  timestamp: this.currentTime,
                  teamId: this.teamId,
                };
                this.combinedData = [actionPayload];
                console.log(
                  'Datos combinados:',
                  this.combinedData,
                  selectedPlayer.player.name,
                  selectedRating[2]
                );
                this.matchService
                  .postActionRegister(actionPayload)
                  .pipe(takeUntil(this.destroy$))
                  .subscribe(
                    (response) => {
                      console.log(
                        'Registro de acción guardado con éxito:',
                        response
                      );
                    },
                    (error) => {
                      console.error(
                        'Error al guardar el registro de acción:',
                        error
                      );
                    }
                  );
              }
            });
        }
      });
  }
  /** Quick action buttons handler (saque, recepcion, ataque, bloqueo) */
  onQuickAction(action: string) {
    console.log('[Editor] quick action ->', action);
    // basic behavior: set anotacion mode and prefill annotationText to help user
    this.anotacionMode = true;
    this.annotationText = action;
  }
  loadYouTubeAPI() {
    // Avoid adding the script multiple times
    if (document.getElementById('youtube-api-script')) return;

    const tag = document.createElement('script');
    tag.id = 'youtube-api-script';
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      document.head.appendChild(tag);
    }

    // The API will call this global function when ready — route it to our instance method
    (window as any)['onYouTubeIframeAPIReady'] = () =>
      this.onYouTubeIframeAPIReady();
  }
  onYouTubeIframeAPIReady() {
    this.player = new YT.Player('player', {
      height: '100%',
      width: '100%',
      // Use the match's youtubeId when available, otherwise fallback to a default video
      videoId: this.youtubeId || '2bFcjYeiDRo',
      playerVars: {
        controls: 0, // Oculta los controles
        showinfo: 0, // Oculta la información del video
        rel: 0, // Evita mostrar videos relacionados al final
        modestbranding: 1, // Oculta el logo de YouTube
      },
      events: {
        onReady: this.onPlayerReady.bind(this),
        onStateChange: this.onPlayerStateChange.bind(this),
      },
    });
  }

  /**
   * Fetch youtubeId for the current match and either show input or load the player.
   */
  fetchYoutubeId() {
    if (!this.matchId) {
      console.warn('[Editor] No matchId available to fetch youtubeId');
      this.showYoutubeInput = true;
      return;
    }

    this.matchService.getYoutubeId(this.matchId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: YoutubeIdResponse) => {
          this.youtubeId = res?.youtubeId ?? null;
          if (!this.youtubeId) {
            // Show input to allow user to add a youtubeId
            this.showYoutubeInput = true;
          } else {
            // We have a video id -> load YouTube API/player
            this.showYoutubeInput = false;
            this.loadYouTubeAPI();
          }
        },
        (err) => {
          console.error('[Editor] Error fetching youtubeId:', err);
          // Fallback: allow manual entry
          this.showYoutubeInput = true;
        }
      );
  }

  submitYoutubeId() {
    const id = (this.youtubeInput || '').trim();
    if (!id) return;
    
    this.matchService.updateYoutubeId(this.matchId, id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          console.log('[Editor] youtubeId saved:', res);
          this.youtubeId = id;
          this.showYoutubeInput = false;
          // Load the player now that we have an id
          this.loadYouTubeAPI();
        },
        (err) => {
          console.error('[Editor] Error saving youtubeId:', err);
        }
      );
  }
  onPlayerReady(event: YT.PlayerEvent) {
    this.duration = this.player?.getDuration() ?? 0;
    console.log(this.duration);
    this.play = false;
    // Set initial volume on the YouTube player
    if (this.player && (this.player as any).setVolume) {
      this.player.setVolume(Math.round(this.volume * 100));
    }
    // populate available quality levels if the API exposes them

    const quals = (this.player as any).getPlaybackQuality() || [];
    this.availableQualities = Array.isArray(quals) ? quals : [];
    this.updatePlayerInfo();
  }

  /** Convert YouTube quality code to a human readable label */
  getQualityLabel(q: string): string {
    const map: { [k: string]: string } = {
      tiny: '144p',
      small: '240p',
      medium: '360p',
      large: '480p',
      hd720: '720p',
      hd1080: '1080p',
      hd1440: '1440p',
      hd2160: '2160p',
      highres: 'High',
      default: 'Auto',
    };
    return map[q] || q;
  }

  onQualityChange(quality: string) {
    if (!quality) return;
    try {
      const p: any = this.player;
      if (p && typeof p.setPlaybackQuality === 'function') {
        p.setPlaybackQuality(quality);
        this.currentQuality = quality;
        console.log('[Editor] setPlaybackQuality ->', quality);
      } else {
        console.warn('[Editor] player does not support setPlaybackQuality');
      }
    } catch (e) {
      console.error('[Editor] onQualityChange failed', e);
    }
  }

  onPlayerStateChange(event: YT.OnStateChangeEvent) {
    if (event.data == YT.PlayerState.PLAYING) {
      this.updatePlayerInfo();
    }
  }
  getProgressBackground(currentTime: number, duration: number): string {
    const percentage = (currentTime / duration) * 100;
    return `linear-gradient(to right, #ffffff ${percentage}%, rgba(65, 85, 97, 0.36) ${percentage}%)`;
  }

  updatePlayerInfo() {
    setInterval(() => {
      if (this.player) {
        this.currentTime = this.player.getCurrentTime();
        this.playbackRate = this.player.getPlaybackRate();
        // evaluate events whenever currentTime changes
        try {
          this.checkEventsForTime(this.currentTime);
        } catch (e) {
          console.warn('[EventMonitor] check failed', e);
        }
      }
    }, 1000);
  }
  changePlaybackRate(rate: number) {
    if (this.player) {
      this.currentPlaybackRate = rate;
      this.player.setPlaybackRate(rate);
      this.playbackRate = this.player.getPlaybackRate();
    }
  }
  playVideo() {
    this.play = true;
    this.player?.playVideo();
  }
  pauseVideo() {
    this.play = false;
    this.player?.pauseVideo();
  }

  // Toggle mute/unmute state
  toggleMute() {
    try {
      const p: any = this.player;
      if (p && typeof p.isMuted === 'function') {
        if (p.isMuted()) {
          p.unMute();
          this.isMuted = false;
        } else {
          p.mute();
          this.isMuted = true;
        }
      } else {
        // fallback toggle using volume
        const currentVol =
          this.player && (this.player as any).getVolume
            ? (this.player as any).getVolume()
            : Math.round(this.volume * 100);
        if (currentVol === 0) {
          if (this.player && (this.player as any).setVolume)
            this.player.setVolume(Math.round((this.volume || 1) * 100));
          this.isMuted = false;
        } else {
          if (this.player && (this.player as any).setVolume)
            this.player.setVolume(0);
          this.isMuted = true;
        }
      }
    } catch (e) {
      console.warn('[Editor] toggleMute failed', e);
    }
  }

  // Frame stepping (approximate using 1/30s)
  nextFrame() {
    const p: any = this.player;
    const cur =
      p && typeof p.getCurrentTime === 'function'
        ? p.getCurrentTime()
        : this.currentTime;
    this.seekTo(cur + 1 / 30);
    this.pauseVideo();
  }

  prevFrame() {
    const p: any = this.player;
    const cur =
      p && typeof p.getCurrentTime === 'function'
        ? p.getCurrentTime()
        : this.currentTime;
    this.seekTo(Math.max(0, cur - 1 / 30));
    this.pauseVideo();
  }

  // Speed controls
  speedUp() {
    const next = Math.min(4, (this.currentPlaybackRate || 1) + 0.25);
    this.changePlaybackRate(next);
  }

  speedDown() {
    const next = Math.max(0.1, (this.currentPlaybackRate || 1) - 0.25);
    this.changePlaybackRate(next);
  }
  seekTo(seconds: number) {
    console.log('Seeking to:', seconds);
    // update local time immediately so the event-checker can react synchronously
    this.currentTime = seconds;
    try {
      this.checkEventsForTime(seconds);
    } catch (e) {
      console.warn('[EventMonitor] check failed during seek', e);
    }
    this.player?.seekTo(seconds, true);
  }
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  toggleFullScreen(): void {
    const playerElement = this.player?.getIframe(); // Obtener el iframe del reproductor de YouTube

    if (playerElement) {
      if (!this.isFullScreen) {
        if (playerElement.requestFullscreen) {
          playerElement.requestFullscreen();
          this.isFullScreen = true;
          document
            .querySelector('.player-container')
            ?.classList.add('fullscreen');
        }
        this.isFullScreen = true;
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
          this.isFullScreen = false;
          document
            .querySelector('.player-container')
            ?.classList.remove('fullscreen');
        }
      }
    }
  }

  /**
   * Global keyboard shortcuts for the YouTube player and editor.
   * - Space: toggle play/pause
   * - M: mute/unmute
   * - ArrowRight / ArrowLeft: seek +5 / -5 seconds
   * - . / , : step next/prev frame (assumes 30fps)
   * - > / < : increase / decrease playback speed by 0.25
   */
  @HostListener('window:keydown', ['$event'])
  handleGlobalKeydown(event: KeyboardEvent) {
    // Ignore when user is typing in an input/textarea or contenteditable
    const target = event.target as HTMLElement | null;
    if (target) {
      const tag = (target.tagName || '').toLowerCase();
      const editable = (target as any).isContentEditable;
      if (tag === 'input' || tag === 'textarea' || editable) return;
    }

    const p: any = this.player as any;
    const key = event.key;

    switch (key) {
      case ' ':
      case 'Spacebar': // legacy
        event.preventDefault();
        this.onPlayPause();
        break;
      case 'm':
      case 'M':
        if (p) {
          try {
            if (typeof p.isMuted === 'function') {
              if (p.isMuted()) p.unMute();
              else p.mute();
            } else {
              // Fallback: toggle volume between 0 and previous volume
              const vol =
                this.player && (this.player as any).getVolume
                  ? (this.player as any).getVolume()
                  : Math.round(this.volume * 100);
              if (vol === 0) {
                if (this.player && (this.player as any).setVolume)
                  this.player.setVolume(Math.round((this.volume || 1) * 100));
              } else {
                if (this.player && (this.player as any).setVolume)
                  this.player.setVolume(0);
              }
            }
          } catch (e) {
            console.warn('[Editor] mute toggle failed', e);
          }
        }
        break;
      case 'ArrowRight':
        this.seekTo(
          p && typeof p.getCurrentTime === 'function'
            ? p.getCurrentTime() + 5
            : this.currentTime + 5
        );
        break;
      case 'ArrowLeft':
        this.seekTo(
          p && typeof p.getCurrentTime === 'function'
            ? p.getCurrentTime() - 5
            : this.currentTime - 5
        );
        break;
      case '.':
        // next frame (approximate at 30fps)
        this.seekTo(
          p && typeof p.getCurrentTime === 'function'
            ? p.getCurrentTime() + 1 / 30
            : this.currentTime + 1 / 30
        );
        this.pauseVideo();
        break;
      case ',':
        // previous frame (approximate at 30fps)
        this.seekTo(
          p && typeof p.getCurrentTime === 'function'
            ? p.getCurrentTime() - 1 / 30
            : this.currentTime - 1 / 30
        );
        this.pauseVideo();
        break;
      case '>':
        // increase playback speed
        this.changePlaybackRate(
          Math.min(4, (this.currentPlaybackRate || 1) + 0.25)
        );
        break;
      case '<':
        // decrease playback speed
        this.changePlaybackRate(
          Math.max(0.1, (this.currentPlaybackRate || 1) - 0.25)
        );
        break;
      default:
        break;
    }
  }
  handleMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.handleSeek(event);
  }

  handleMouseMove(event: MouseEvent) {
    if (this.timelineRef) {
      const rect = this.timelineRef.nativeElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const time = (x / rect.width) * this.duration;
      this.hoveredTime = time;

      if (this.isDragging) {
        this.handleSeek(event);
      }
    }
  }

  handleMouseUp() {
    this.isDragging = false;
  }

  handleMouseLeave() {
    this.hoveredTime = null;
    this.isDragging = false;
  }

  private handleSeek(event: MouseEvent) {
    const rect = this.timelineRef.nativeElement.getBoundingClientRect();
    const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    const time = (x / rect.width) * this.duration;
    this.seekTo(time);
  }

  get timeMarkers() {
    return Array.from({ length: 10 }, (_, i) =>
      Math.floor((this.duration / 10) * i)
    );
  }
  onToolSelect(tool: AnnotationType | 'select' | 'eraser') {
    this.selectedTool = tool;
    console.log('Herramienta seleccionada:', tool);
  }

  // Función que se dispara al cambiar el color
  onColorChange(event: any): void {
    // Propaga el nuevo color a la propiedad que se pasa al canvas
    this.color = event;
    console.log('Color cambiado a:', event);
  }

  // Función que se dispara al cambiar el grosor del trazo
  onStrokeWidthChange(event: any): void {
    this.strokeWidth = Number(event);
    console.log('Grosor del trazo cambiado a:', this.strokeWidth);
  }

  // Función que se dispara al cambiar la opacidad
  onOpacityChange(event: any): void {
    this.opacity = Number(event);
    console.log('Opacidad cambiada a:', this.opacity);
  }

  // Función que se dispara al hacer undo
  onUndo(): void {
    console.log('Undo realizado');
  }

  // Función que se dispara al hacer redo
  onRedo(): void {
    console.log('Redo realizado');
  }

  // --- Player controls for overlay ---
  onPlayPause(): void {
    if (this.play) {
      this.pauseVideo();
    } else {
      this.playVideo();
    }
  }

  skipBack(seconds: number = 1): void {
    const current = this.player?.getCurrentTime() ?? this.currentTime;
    const target = Math.max(0, current - seconds);
    this.seekTo(target);
  }

  skipForward(seconds: number = 1): void {
    const current = this.player?.getCurrentTime() ?? this.currentTime;
    const target = Math.min(this.duration, current + seconds);
    this.seekTo(target);
  }

  onVolumeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const v = parseFloat(input.value);
    this.volume = isNaN(v) ? this.volume : v;
    if (this.player && (this.player as any).setVolume) {
      this.player.setVolume(Math.round(this.volume * 100));
    }
  }

  handleAddAnnotation(annotation: Annotation) {
    // Añadir a la lista usada en template
    if (!this.anotaciones) this.anotaciones = [];
    this.anotaciones.push(annotation);
    console.log('[Editor] Received annotation from canvas:', annotation);

    // Preparar payload para backend y esperar a que el usuario añada (o cancele) la descripción
    const dbPayload = {
      annotation_id: annotation.id,
      type: annotation.type,
      timestamp: annotation.timestamp,
      visible: annotation.visible,
      color: annotation.color,
      opacity: annotation.opacity,
      strokeWidth: annotation.strokeWidth ?? undefined,
      data: annotation.data,
      source: 'annotation-canvas',
      matchId: this.matchId || undefined,
      eventIndex: this.currentEventIndex ?? undefined,
    };
    console.log(
      '[Editor] Prepared DB payload (waiting for description):',
      dbPayload
    );

    // store payload temporarily; actual create will run on save or cancel
    this.pendingDbPayloads[annotation.id] = dbPayload;
    // Mostrar cuadro para que el usuario añada una descripción breve (puede cancelar)
    this.pendingAnnotationId = annotation.id;
    this.pendingAnnotationText = '';

    // compute popup position from annotation.data.popupPos if available
    const popup = annotation?.data?.popupPos;
    if (
      popup &&
      typeof popup.clientX === 'number' &&
      typeof popup.clientY === 'number'
    ) {
      console.log('[Editor] Received popup client coords:', popup);
      this.pendingPopupStyle = this.computePopupStyleFromClient(
        popup.clientX,
        popup.clientY
      );
      console.log(
        '[Editor] Computed pendingPopupStyle:',
        this.pendingPopupStyle
      );
    } else {
      // fallback: top-right of player
      // compute a fallback relative to the player container center
      try {
        const rect =
          this.playerContainerRef?.nativeElement?.getBoundingClientRect();
        if (rect) {
          const left = rect.width - 12 - 340; // right aligned fallback using assumed popup width
          const top = 12;
          this.pendingPopupStyle = {
            position: 'absolute',
            left: `${Math.max(8, left)}px`,
            top: `${top}px`,
            zIndex: '60',
          };
        } else {
          this.pendingPopupStyle = {
            top: '12px',
            right: '12px',
            position: 'absolute',
            zIndex: '50',
          };
        }
      } catch (e) {
        this.pendingPopupStyle = {
          top: '12px',
          right: '12px',
          position: 'absolute',
          zIndex: '50',
        };
      }
    }

    // After finishing a drawing, revert to the select tool so user doesn't keep drawing
    this.selectedTool = 'select';
  }

  loadActions() {
    this.matchService.getActionTypes().subscribe(
      (response) => {
        console.log('[Editor] Loaded action types:', response);
        const payload: any = response as any;
        const groups: any[] = payload && payload.groups ? payload.groups : [];

        const mapRatings = (group: any): ActionRating[] => {
          const ratings: any[] = group && group.ratings ? group.ratings : [];
          return ratings.map((r: any) => [
            Number(r?.id ?? 0),
            String(r?.symbol ?? ''),
            String(r?.label ?? ''),
            r?.description != null ? String(r.description) : undefined,
          ] as ActionRating);
        };

        this.saque = mapRatings(groups[0] || { ratings: [] });
        this.rece = mapRatings(groups[1] || { ratings: [] });
        this.ataque = mapRatings(groups[2] || { ratings: [] });
        this.colo = mapRatings(groups[3] || { ratings: [] });

        console.log('[Editor] Actions parsed:', {
          saque: this.saque,
          rece: this.rece,
          ataque: this.ataque,
          colo: this.colo,
        });
      },
      (error) => {
        console.error('[Editor] Error loading action types:', error);
      }
    );
  }

  handleHoverAnnotation(event: {
    id: string | null;
    clientX?: number;
    clientY?: number;
  }) {
    // Do not show hover popup while user is editing a newly created pending annotation
    if (this.pendingAnnotationId) return;

    if (!event || !event.id) {
      this.hoverAnnotationId = null;
      this.hoverPopupStyle = null;
      this.hoverAnnotationDescription = null;
      this.highlightedAnnotationId = null;
      return;
    }

    const id = event.id;
    const ann = this.anotaciones.find((a) => a.id === id);
    if (!ann) {
      this.hoverAnnotationId = null;
      this.hoverPopupStyle = null;
      this.hoverAnnotationDescription = null;
      this.highlightedAnnotationId = null;
      return;
    }

    const desc = ann.description ?? (ann.data && ann.data.description) ?? null;
    if (!desc) {
      // nothing to show
      this.hoverAnnotationId = null;
      this.hoverPopupStyle = null;
      this.hoverAnnotationDescription = null;
      this.highlightedAnnotationId = null;
      return;
    }

    // compute popup style relative to player container
    if (
      typeof event.clientX === 'number' &&
      typeof event.clientY === 'number'
    ) {
      this.hoverPopupStyle = this.computePopupStyleFromClient(
        event.clientX,
        event.clientY
      );
      console.log(
        '[Editor] hover annotation coords',
        event,
        'style',
        this.hoverPopupStyle
      );
    } else {
      this.hoverPopupStyle = {
        position: 'absolute',
        top: '12px',
        right: '12px',
        zIndex: '60',
      };
    }

    this.hoverAnnotationId = id;
    this.hoverAnnotationDescription = desc;
    this.highlightedAnnotationId = id; // trigger canvas highlight effect
  }

  private createAnnotationOnBackend(
    annotationId: string,
    description?: string | null
  ) {
    const payload = this.pendingDbPayloads[annotationId];
    if (!payload) {
      console.warn(
        '[Editor] No pending payload found for annotation',
        annotationId
      );
      return;
    }

    // attach description at top-level and inside data for compatibility
    const payloadToSend = {
      ...payload,
      description: description ?? undefined,
      data: { ...(payload.data || {}), description: description ?? undefined },
    };

    this.annotationService.createAnnotation(payloadToSend).subscribe(
      (saved) => {
        console.log('[Editor] Annotation saved to DB:', saved);
        // Store the backend ID in the local annotation for future deletion
        const localAnnotation = this.anotaciones.find(
          (a) => a.id === annotationId
        );
        if (localAnnotation && saved.id) {
          localAnnotation.dbId = saved.id;
          // also update local data/description
          localAnnotation.data = payloadToSend.data;
          localAnnotation.description = description ?? '';
        }
        // cleanup
        delete this.pendingDbPayloads[annotationId];
      },
      (error) => {
        console.error('[Editor] Error saving annotation to DB:', error);
      }
    );
  }

  private normalizeEvent(raw: Partial<MatchEventDetail> | any): any {
    return {
      id: Number(raw?.id ?? 0),
      eventId: Number(raw?.eventId ?? 0),
      matchId: Number(raw?.matchId ?? this.matchId ?? 0),
      playerId: Number(raw?.playerId ?? 0),
      team: raw?.team,
      playerName: raw?.playerName,
      dorsal: raw?.dorsal,
      faultType: String(raw?.faultType ?? ''),
      faultTypeName: raw?.faultTypeName,
      scoreLocal: Number(raw?.scoreLocal ?? 0),
      scoreVisitor: Number(raw?.scoreVisitor ?? 0),
      setsLocal: Number(raw?.setsLocal ?? 0),
      setsVisitor: Number(raw?.setsVisitor ?? 0),
      timestamp: raw?.timestamp,
      actionType: raw?.actionType,
      isSuccess: raw?.isSuccess,
      event: {
        isSuccess: Boolean(raw?.event?.isSuccess ?? raw?.isSuccess ?? false),
        type: raw?.event?.type,
      },
      player: {
        player_name: String(raw?.player?.player_name ?? raw?.playerName ?? ''),
      },
    };
  }

  saveAnnotationDescription() {
    if (!this.pendingAnnotationId) return;
    const id = this.pendingAnnotationId;
    const text = this.pendingAnnotationText?.trim();
    const ann = this.anotaciones.find((a) => a.id === id);
    if (!ann) {
      // nothing to save
      this.pendingAnnotationId = null;
      this.pendingAnnotationText = '';
      return;
    }

    // update local representation
    ann.data = { ...(ann.data || {}), description: text };
    ann.description = text;

    if (ann.dbId) {
      // Persist description immediately on existing DB row
      this.annotationService
        .updateAnnotation(ann.dbId, {
          data: ann.data,
          description: text ?? null,
        })
        .subscribe(
          (updated) => {
            console.log('[Editor] Annotation description updated:', updated);
          },
          (err) => console.error('[Editor] Error updating description:', err)
        );
      // cleanup pending payload if any
      delete this.pendingDbPayloads[id];
    } else {
      // create annotation now with the provided description (may be empty)
      this.createAnnotationOnBackend(id, text ?? null);
    }

    // close editor
    this.pendingAnnotationId = null;
    this.pendingAnnotationText = '';
    this.pendingPopupStyle = null;
  }

  cancelAnnotationDescription() {
    // If the annotation hasn't been saved yet, create it without description
    if (this.pendingAnnotationId) {
      const id = this.pendingAnnotationId;
      const ann = this.anotaciones.find((a) => a.id === id);
      if (ann && !ann.dbId) {
        // create without description
        this.createAnnotationOnBackend(id, null);
      }
    }

    this.pendingAnnotationId = null;
    this.pendingAnnotationText = '';
    this.pendingPopupStyle = null;
  }

  private computePopupStyleFromClient(clientX: number, clientY: number) {
    // Compute popup position relative to the player container (so absolute positioning aligns to its offset)
    const popupW = 340; // px assumed
    const popupH = 160; // px assumed

    try {
      const container = this.playerContainerRef?.nativeElement as
        | HTMLElement
        | undefined;
      if (!container) {
        // fallback to viewport-based positioning
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        let left = clientX + 12;
        let top = clientY + 12;
        if (left + popupW > vw - 8) left = Math.max(8, clientX - popupW - 12);
        if (top + popupH > vh - 8) top = Math.max(8, clientY - popupH - 12);
        console.warn(
          '[Editor] playerContainerRef not available, using viewport coords'
        );
        return {
          position: 'absolute',
          left: `${left}px`,
          top: `${top}px`,
          zIndex: '60',
        };
      }

      const rect = container.getBoundingClientRect();
      // convert client coords (viewport) to container-local coords
      let left = clientX - rect.left + 12; // small right offset
      let top = clientY - rect.top + 12; // small down offset

      // clamp inside container's inner area with small margin
      const margin = 8;
      if (left + popupW > rect.width - margin) {
        left = Math.max(margin, clientX - rect.left - popupW - 12);
      }
      if (top + popupH > rect.height - margin) {
        top = Math.max(margin, clientY - rect.top - popupH - 12);
      }

      // ensure values are integers and non-negative
      left = Math.max(margin, Math.round(left));
      top = Math.max(margin, Math.round(top));

      console.log(
        '[Editor] container rect:',
        rect,
        'client:',
        { clientX, clientY },
        'computed left/top:',
        { left, top }
      );
      return {
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        zIndex: '60',
      };
    } catch (e) {
      console.error('[Editor] computePopupStyleFromClient error', e);
      return { position: 'absolute', top: '12px', right: '12px', zIndex: '60' };
    }
  }
  setSelectedAnnotationId(id: string) {
    this.selectedAnnotationId = id;
    console.log('Annotation selected:', id);

    // Find the annotation and jump to its timestamp in the video
    const annotation = this.anotaciones.find((a: Annotation) => a.id === id);
    if (annotation && annotation.timestamp !== undefined) {
      // Pause the video for better focus
      this.pauseVideo();

      // Jump to the annotation timestamp
      this.seekTo(annotation.timestamp);
      console.log(
        `[Editor] Jumped to annotation timestamp: ${annotation.timestamp}s`
      );

      // Highlight the annotation temporarily (2 seconds pulse effect)
      this.highlightedAnnotationId = id;
      setTimeout(() => {
        this.highlightedAnnotationId = null;
      }, 2000);
    }
  }

  handleToggleVisibility(id: string) {
    const annotation = this.anotaciones.find((a: Annotation) => a.id === id);
    if (annotation) {
      annotation.visible = !annotation.visible;
      console.log(`Annotation ${id} visibility:`, annotation.visible);
    }
  }

  handleDeleteAnnotation(id: string) {
    // Find the annotation to get its database ID
    const annotation = this.anotaciones.find((a: Annotation) => a.id === id);

    if (annotation && annotation.dbId) {
      // Delete from backend first
      this.annotationService.deleteAnnotation(annotation.dbId).subscribe(
        () => {
          console.log('[Editor] Annotation deleted from DB:', annotation.dbId);
          // Remove from local array after successful backend deletion
          this.anotaciones = this.anotaciones.filter(
            (a: Annotation) => a.id !== id
          );
          if (this.selectedAnnotationId === id) {
            this.selectedAnnotationId = null;
          }
        },
        (error) => {
          console.error('[Editor] Error deleting annotation:', error);
          // Still remove from UI even if backend delete fails
          this.anotaciones = this.anotaciones.filter(
            (a: Annotation) => a.id !== id
          );
          if (this.selectedAnnotationId === id) {
            this.selectedAnnotationId = null;
          }
        }
      );
    } else {
      // No backend ID, just remove from local array (annotation was never saved or is temporary)
      this.anotaciones = this.anotaciones.filter(
        (a: Annotation) => a.id !== id
      );
      if (this.selectedAnnotationId === id) {
        this.selectedAnnotationId = null;
      }
      console.log('[Editor] Annotation deleted locally:', id);
    }
  }
  /**
   * Synchronize events with the current video playback position.
   * For each event we add a new numeric property `timeStamp` computed as:
   *   timeStamp = event.timestamp - datosDePartido.lastRequestAt + tiempoReferencia
   *
   * The method is tolerant of different timestamp formats (number, ISO string)
   * and will try to coerce values to seconds.
   */
  sincronizarVideo() {
    // If the partido has a lastRequestAt timestamp, capture the current player time
    if (this.datosDePartido && this.datosDePartido.lastRequestAt) {
      this.tiempoReferencia = this.currentTime;
    }

    // Helper to parse a timestamp-like value into seconds (number)
    const parseToSeconds = (val: any): number => {
      if (val === null || val === undefined) return 0;
      if (typeof val === 'number' && !isNaN(val)) return val;
      // If it's a numeric string
      const asNum = Number(val);
      if (!isNaN(asNum)) return asNum;
      // If it's a date-like string, parse as ms -> convert to seconds
      const parsed = Date.parse(String(val));
      if (!isNaN(parsed)) return Math.floor(parsed / 1000);
      return 0;
    };

    // Keep the raw baseline value; we'll subtract first and then normalize to seconds
    const baselineRaw = this.datosDePartido?.lastRequestAt ?? 0;
    const referencia = Number(this.tiempoReferencia ?? 0);

    // Helper to coerce a value into either a numeric-seconds or ms timestamp
    const toTypedValue = (val: any): { v: number; unit: 'number' | 'ms' } => {
      if (val === null || val === undefined) return { v: 0, unit: 'number' };
      if (typeof val === 'number' && !isNaN(val))
        return { v: val, unit: 'number' };
      // numeric string
      const asNum = Number(val);
      if (!isNaN(asNum)) return { v: asNum, unit: 'number' };
      // date-like string -> parse to milliseconds
      const parsed = Date.parse(String(val));
      if (!isNaN(parsed)) return { v: parsed, unit: 'ms' };
      return { v: 0, unit: 'number' };
    };

    if (
      !this.eventos ||
      !Array.isArray(this.eventos) ||
      this.eventos.length === 0
    ) {
      console.warn('[Editor] No eventos to sincronizar');
      return;
    }

    // Preserve the nested-set structure while adding `timeStamp` to each event
    this.eventos = this.eventos.map((set: any[]) => {
      if (!Array.isArray(set)) return set;
      return set.map((ev: any) => {
        // Step 1: subtract raw values (event.timestamp - baseline)
        const a = toTypedValue(ev?.timestamp ?? 0);
        const b = toTypedValue(baselineRaw);

        // Step 2: normalize the difference to seconds
        let diffSeconds = 0;
        if (a.unit === 'ms' && b.unit === 'ms') {
          diffSeconds = (a.v - b.v) / 1000;
        } else if (a.unit === 'number' && b.unit === 'number') {
          // assume numeric values are already seconds
          diffSeconds = a.v - b.v;
        } else {
          // mixed units: convert numeric (seconds) to ms, compute diff, then to seconds
          const aMs = a.unit === 'ms' ? a.v : a.v * 1000;
          const bMs = b.unit === 'ms' ? b.v : b.v * 1000;
          diffSeconds = (aMs - bMs) / 1000;
        }

        // Step 3: add the reference (tiempoReferencia)
        const timeStamp = diffSeconds + referencia;

        // keep immutability-ish by returning a shallow copy with new prop
        return { ...ev, timeStamp };
      });
    });

    // For logging, convert baselineRaw into seconds when possible
    const baselineTyped = toTypedValue(baselineRaw);
    const baselineSeconds =
      baselineTyped.unit === 'ms' ? baselineTyped.v / 1000 : baselineTyped.v;
    console.log(
      '[Editor] eventos sincronizados (timeStamp added). tiempoReferencia:',
      referencia,
      'baselineSeconds:',
      baselineSeconds,
      this.eventos
    );
  }

  /**
   * Monitor eventos and when currentTime >= event.timeStamp - 2 seconds,
   * mark the event as shown and log requested fields.
   * This preserves a lightweight flag `_shown` on the event to avoid duplicate logs.
   */
  startEventMonitor(intervalMs: number = 300) {
    // Switch to an event-driven monitor: clear any old interval and
    // mark monitoring active so `checkEventsForTime` will run on time changes.
    if (this._eventMonitor) {
      try {
        clearInterval(this._eventMonitor);
      } catch (e) {
        /* ignore */
      }
      this._eventMonitor = null;
    }
    this._eventMonitorActive = true;
    this._lastCheckedTime = this.currentTime ?? 0;
  }

  /**
   * Evaluate events at the given time. This is called whenever `currentTime`
   * is updated (including on backward seeks). It selects the most recent
   * event whose (timeStamp - 2) <= time and sets it as `currentEvent`.
   */
  checkEventsForTime(time: number) {
    if (!this._eventMonitorActive) return;
    if (!this.eventos || !Array.isArray(this.eventos) || this.eventos.length === 0) return;

    const prevTime = this._lastCheckedTime ?? time;

    // flatten nested sets
    const flat: Array<{ ev: any; setIndex: number; index: number }> = [];
    for (let s = 0; s < this.eventos.length; s++) {
      const setArr = this.eventos[s];
      if (!Array.isArray(setArr)) continue;
      for (let i = 0; i < setArr.length; i++) {
        flat.push({ ev: setArr[i], setIndex: s, index: i });
      }
    }

    flat.forEach((item) => {
      const ev = item.ev;
      const triggerAt = Number(ev?.timeStamp) - 2;
      if (!isNaN(triggerAt) && time < triggerAt && ev._shown) {
        ev._shown = false;
      }
    });

    // candidates that should be active now
    const candidates = flat
      .filter((item) => {
        const ev = item.ev;
        if (!ev || ev.timeStamp === undefined) return false;
        const triggerAt = Number(ev.timeStamp) - 2;
        return !isNaN(triggerAt) && time >= triggerAt;
      })
      .sort((a, b) => Number(b.ev.timeStamp) - Number(a.ev.timeStamp));

    if (candidates.length > 0) {
      const topItem = candidates[0];
      const top = topItem.ev;

      // Update indices so the UI/selection reflects the monitored current event
      if (
        this.currentSetIndex !== topItem.setIndex ||
        this.currentEventIndex !== topItem.index
      ) {
        this.currentSetIndex = topItem.setIndex;
        this.currentEventIndex = topItem.index;
        // Keep selected indices in sync with the current indices
        this.selectedSetIndex = this.currentSetIndex;
        this.selectedEventIndex = this.currentEventIndex;
      }

      if (!this.currentEvent || this.currentEvent.id !== top.id) {
        this.currentEvent = top;
        console.log(
          '[EventMonitor] currentEvent ->',
          this.currentEvent,
          'setIndex=',
          this.currentSetIndex,
          'eventIndex=',
          this.currentEventIndex
        );
      }
      top._shown = true;
    } else {
      if (this.currentEvent) {
        this.currentEvent = null;
        console.log('[EventMonitor] currentEvent cleared');
      }
      // We intentionally keep indices as-is so manual selection/position is not lost.
    }

    this._lastCheckedTime = time;
  }

  stopEventMonitor() {
    if (this._eventMonitor) {
      try {
        clearInterval(this._eventMonitor);
      } catch (e) {
        /* ignore */
      }
      this._eventMonitor = null;
    }
    this._eventMonitorActive = false;
    this._lastCheckedTime = null;
  }

  ngOnDestroy(): void {
    // Clean up event monitor
    this.stopEventMonitor();
    
    // Unsubscribe from all observables
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Apply a saved reference object (from localStorage) to the current editor state.
   * This is tolerant: if the saved object contains indices or timestamps we re-sync them.
   */
  applySavedReference(ref: any) {
    if (!ref) return;
    try {
      // If the saved reference contains explicit set/index, restore selection
      if (typeof ref.setIndex === 'number') {
        this.currentSetIndex = ref.setIndex;
        this.selectedSetIndex = ref.setIndex;
      }
      if (typeof ref.eventIndex === 'number') {
        this.currentEventIndex = ref.eventIndex;
        this.selectedEventIndex = ref.eventIndex;
      }
      // If reference contains a timestamp or tiempoReferencia, prefer that
      if (ref.timeStamp !== undefined) {
        this.tiempoReferencia = Number(ref.timeStamp) || this.tiempoReferencia;
      } else if (ref.timestamp !== undefined) {
        this.tiempoReferencia = Number(ref.timestamp) || this.tiempoReferencia;
      } else if (ref.savedAt) {
        // keep savedAt for info only
      }
      // Reload current event / UI to reflect restored indices
      this.loadCurrentEvent();
      this.scrollToTop();
      console.log('[Editor] applySavedReference applied', { set: this.currentSetIndex, event: this.currentEventIndex, tiempoReferencia: this.tiempoReferencia });
    } catch (e) {
      console.warn('[Editor] applySavedReference failed', e);
    }
  }
  }
