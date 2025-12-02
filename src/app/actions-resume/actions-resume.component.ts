import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatchService } from '../services/match.service';
interface PositionSeries {
    name: string;
    series: Array<{ name: string; value: number }>;
}
@Component({
  selector: 'app-actions-resume',
  templateUrl: './actions-resume.component.html',
  styleUrl: './actions-resume.component.css'
})

export class ActionsResumeComponent implements OnInit {
  saques: any = {};
  reces : any ={};
  ataques : any ={};
  colocacion : any ={};
  // Selected player for per-player reception breakdown (null = aggregated/default)
  receSelectedPlayer: string | null = null;
  activeTab: string = 'overview';
  @Input() matchId: number = 111;

  // If parent updates matchId after init, reload data
  ngOnChanges(changes: SimpleChanges) {
    const change = changes['matchId'];
    if (change && !change.isFirstChange()) {
      this.getSaques();
    }
  }
  constructor(private matchService:MatchService) { }
  ngOnInit(): void {
    // load initial data
    this.getSaques();
    this.getReces();
    this.getAtaques();
    this.getColocaciones();  
  }
  getSaques(){
    const id = Number(this.matchId ?? 111) || 111;
    this.matchService.getSaques(id).subscribe(data=>{
      console.log('saques',data);
      this.saques=data;
    }); 
  }

  get percentSaque(): number {
    try {
      const total = Number(this.saques?.total ?? 0);
      const byHash = Number((this.saques?.bySymbol && this.saques.bySymbol['#']) ?? 0);
      if (!total || total === 0) return 0;
      return Math.round((byHash / total) * 100);
    } catch (e) {
      return 0;
    }
  }
  getReces(){
    const id = Number(this.matchId ?? 111) || 111;
    this.matchService.getReces(id).subscribe(data=>{
      console.log('reces',data);
      this.reces = data;
      console.log('playerReceScores', this.playerReceScores);
    }); 
  }
  get percentRece(): number {
    try {
      const total = Number(this.reces?.total ?? 0); 
      const byHash = Number((this.reces?.bySymbol && this.reces.bySymbol['#']) ?? 0);
      if (!total || total === 0) return 0;
      return Math.round((byHash / total) * 100);
    } catch (e) {
      return 0;
    }   
  };
  getAtaques(){
    const id = Number(this.matchId ?? 111) || 111;
    this.matchService.getAtaques(id).subscribe(data=>{
      console.log('ataques',data);
      this.ataques = data;
    }); 
  }
  get percentAtaque(): number {
    try {
      const total = Number(this.ataques?.total ?? 0);
      const byHash = Number((this.ataques?.bySymbol && this.ataques.bySymbol['#']) ?? 0);
      if (!total || total === 0) return 0;
      return Math.round((byHash / total) * 100);
    } catch (e) {
      return 0;
    }
  }
  getColocaciones(){
    const id = Number(this.matchId ?? 111) || 111;
    this.matchService.getColocaciones(id).subscribe(data=>{
      console.log('colocaciones',data);
      this.colocacion = data;
    }); 
  }

  // Map symbol to numeric value used for charting
  private symbolValue(symbol: string): number {
    const map: Record<string, number> = {
      '#': 10,
      '+': 8,
      '!': 6,
      '-': 4,
      '/': 2,   
      '=': 0,
      
    };
    return map[symbol] ?? 0;
  }
  
  get playerScores(): Array<{ name: string; value: number }> {
    const out: Record<string, { weightedSum: number; totalCount: number }> = {};
    const rows = this.saques?.perPlayerBreakdown ?? [];
    if (!Array.isArray(rows)) return [];
    for (const r of rows) {
      const playerName = r.player_name ?? r.playerName ?? r.player ?? 'Unknown';
      const symbol = r.symbol ?? r.sym ?? r.label ?? r.rating ?? '';
      const cnt = Number(r.cnt ?? r.count ?? r.c ?? 0) || 0;
      const val = this.symbolValue(String(symbol));
      out[playerName] = out[playerName] ?? { weightedSum: 0, totalCount: 0 };
      out[playerName].weightedSum += (val * cnt);
      out[playerName].totalCount += cnt;
      
    }    
    const arr = Object.keys(out).map(k => {
        const data = out[k];
        let average = 0;
        
        // Evitar la división por cero si el jugador no tiene acciones (totalCount > 0)
        if (data.totalCount > 0) {
            average = data.weightedSum / data.totalCount;
        }
        
        return { 
            name: k, 
            value: average // 'value' ahora es el promedio ponderado
        };
    });
    // 4. Ordenamiento por el valor promedio más alto
    return arr.sort((a, b) => b.value - a.value);
  }
  get playerAttackScores(): Array<{ name: string; value: number }> {
    const out: Record<string, { weightedSum: number; totalCount: number }> = {};
    const rows = this.ataques?.perPlayerBreakdown ?? [];
    if (!Array.isArray(rows)) return [];
    for (const r of rows) {
      const playerName = r.player_name ?? r.playerName ?? r.player ?? 'Unknown';
      const symbol = r.symbol ?? r.sym ?? r.label ?? r.rating ?? '';
      const cnt = Number(r.cnt ?? r.count ?? r.c ?? 0) || 0;
      const val = this.symbolValue(String(symbol));
      out[playerName] = out[playerName] ?? { weightedSum: 0, totalCount: 0 };
      out[playerName].weightedSum += (val * cnt);
      out[playerName].totalCount += cnt;
      
    }    
    const arr = Object.keys(out).map(k => {
        const data = out[k];
        let average = 0;
        
        // Evitar la división por cero si el jugador no tiene acciones (totalCount > 0)
        if (data.totalCount > 0) {
            average = data.weightedSum / data.totalCount;
        }
        
        return { 
            name: k, 
            value: average // 'value' ahora es el promedio ponderado
        };
    });
    // 4. Ordenamiento por el valor promedio más alto
    return arr.sort((a, b) => b.value - a.value);
  }
  get playerReceScores(): PositionSeries[] {
    // Definición de 'out' simplificada ya que TypeScript puede inferir la estructura
    const out: Record<string, { players: Record<string, { weightedSum: number; totalCount: number }> }> = {};
    const rows = this.reces?.perPlayerBreakdown ?? [];
    if (!Array.isArray(rows)) return [];

    // 1. Agregación de datos por Posición y luego por Jugador
    for (const r of rows) {
        const position_name = r.position_name ?? r.positionName ?? r.position ?? 'Unknown';
        const playerName = r.player_name ?? r.playerName ?? r.player ?? 'Unknown';
        const symbol = r.symbol ?? r.sym ?? r.label ?? r.rating ?? '';
        const cnt = Number(r.cnt ?? r.count ?? r.c ?? 0) || 0;
        const val = this.symbolValue(String(symbol));

        // Inicializa la posición y el jugador dentro de ella
        out[position_name] = out[position_name] ?? { players: {} };
        out[position_name].players[playerName] = out[position_name].players[playerName] ?? { weightedSum: 0, totalCount: 0 };

        // Acumula la suma ponderada y el total de conteo
        out[position_name].players[playerName].weightedSum += (val * cnt);
        out[position_name].players[playerName].totalCount += cnt;
    }

    // 2. Mapeo y Reestructuración al formato final (PositionSeries[])
    const arr = Object.keys(out).map(positionKey => {
        const positionData = out[positionKey];

        // 3. Crea la 'series' de jugadores para la posición actual
        let playerSeries: Array<{ name: string; value: number }> = Object.keys(positionData.players).map(playerKey => {
            const data = positionData.players[playerKey];
            let average = 0;

            if (data.totalCount > 0) {
                // Cálculo del promedio ponderado (multiplicado por 100)
                average = data.weightedSum / data.totalCount;
            }

            return {
                name: playerKey,
                value: average
            };
        });

        // Opcional: Ordena los jugadores dentro de cada serie por el valor promedio
        playerSeries.sort((a, b) => b.value - a.value);
       
        // Retorna el objeto de posición con la estructura de series
        return {
            name: positionKey,
            series: playerSeries
        };
    });

    // 5. Retorna el arreglo de posiciones (puedes ordenarlo por nombre de posición si lo deseas)
    return arr;
  }

get playerColocacionScores(): Array<{ name: string; value: number }> {
    const out: Record<string, { weightedSum: number; totalCount: number }> = {};
    const rows = this.colocacion?.perPlayerBreakdown ?? [];
    if (!Array.isArray(rows)) return [];
    for (const r of rows) {
      const playerName = r.player_name ?? r.playerName ?? r.player ?? 'Unknown';
      const symbol = r.symbol ?? r.sym ?? r.label ?? r.rating ?? '';
      const cnt = Number(r.cnt ?? r.count ?? r.c ?? 0) || 0;
      const val = this.symbolValue(String(symbol));
      out[playerName] = out[playerName] ?? { weightedSum: 0, totalCount: 0 };
      out[playerName].weightedSum += (val * cnt);
      out[playerName].totalCount += cnt;
      
    }    
    const arr = Object.keys(out).map(k => {
        const data = out[k];
        let average = 0;
        
        // Evitar la división por cero si el jugador no tiene acciones (totalCount > 0)
        if (data.totalCount > 0) {
            average = data.weightedSum / data.totalCount;
        }
        
        return { 
            name: k, 
            value: average // 'value' ahora es el promedio ponderado
        };
    });
    // 4. Ordenamiento por el valor promedio más alto
    return arr.sort((a, b) => b.value - a.value);
  }
  
  // For chart scaling: maximum absolute score among players (or 1 to avoid div by 0)
  get maxAbsScore(): number {
    const arr = this.playerScores.map(p => Math.abs(p.value));
    const max = arr.length ? Math.max(...arr) : 0;
    return max > 0 ? max : 1;
  }

  get scoreDistribution(): number[] {
    const saqueDirecto = Number(this.saques?.breakdown?.[0]?.cnt ?? 0);
    const ataqueDirecto = Number(this.ataques?.breakdown?.[0]?.cnt ?? 0);
    return [
      { name: 'Puntos de Saque', value: saqueDirecto },
      { name: 'Puntos de Ataque', value: ataqueDirecto }
    ] as unknown as number[];
  }
  get eficaciaAtaque(): number[] {
    const ataqueDirecto = Number(this.ataques?.breakdown?.[0]?.cnt ?? 0);
    const ataqueError = Number(this.ataques?.breakdown?.[4]?.cnt ?? 0);
    const ataqueDefendido = Number(this.ataques?.breakdown?.[1]?.cnt ?? 0) + Number(this.ataques?.breakdown?.[2]?.cnt ?? 0);
    const ataqueBloqueado = Number(this.ataques?.breakdown?.[3]?.cnt ?? 0);
    
    return [
      { name: 'Punto Directo', value: ataqueDirecto },
      { name: 'Error', value: ataqueError },
      { name: 'Defendido', value: ataqueDefendido },
      { name: 'Bloqueado', value: ataqueBloqueado }
    ] as unknown as number[];
  }

  get breakdownBySymbol(): { name: string; value: number }[] {
    const symbolData = this.reces?.bySymbol ?? {};
    return Object.entries(symbolData)
      .map(([symbol, value]) => {
        let name: string;
        switch (symbol) {
          case '#':
            name = 'Rece Perfecta';
            break;
          case '+':
            name = 'Rece Positiva';
            break;
          case '-':
            name = 'Rece Negativa';
            break;
          case '/':
            name = 'Rece Muy Negativa';
            break;
          case '=':
            name = 'Error Recepción';
            break;
          default:
            name = 'Otros Símbolos';
        }
        return {
          name,
          
          value: Number(value) || 0
        };
      })
      .sort((a, b) => b.value - a.value);
  }
  /**
   * Players overview combining attack/rece/serve/colocacion per-player stats.
   * Returns an array of rows consumed by the Material table in the overview tab.
   */
  get playersOverview(): Array<any> {
    const categories: Array<{ key: string; rows: any[] }> = [
      { key: 'attack', rows: Array.isArray(this.ataques?.perPlayerBreakdown) ? this.ataques.perPlayerBreakdown : [] },
      { key: 'rece', rows: Array.isArray(this.reces?.perPlayerBreakdown) ? this.reces.perPlayerBreakdown : [] },
      { key: 'serve', rows: Array.isArray(this.saques?.perPlayerBreakdown) ? this.saques.perPlayerBreakdown : [] },
      { key: 'colocacion', rows: Array.isArray(this.colocacion?.perPlayerBreakdown) ? this.colocacion.perPlayerBreakdown : [] },
    ];

    const byPlayer: Record<string, any> = {};
    const getName = (r: any) => (r.player_name ?? r.player ?? r.playerName ?? r.playerId ?? 'Unknown').toString();
    for (const cat of categories) {
      for (const r of cat.rows) {
        const player = getName(r);
        const symbol = r.symbol ?? r.sym ?? r.label ?? r.rating ?? '';
        const cnt = Number(r.cnt ?? r.count ?? r.c ?? 0) || 0;
        const val = this.symbolValue(String(symbol));
        if (!byPlayer[player]) {
          byPlayer[player] = {
            player,
            attackWeighted: 0, attackCount: 0,
            receWeighted: 0, receCount: 0,
            serveWeighted: 0, serveCount: 0,
            colocacionWeighted: 0, colocacionCount: 0,
            // symbol maps per category for detailed breakdown
            attackSymbols: {} as Record<string, number>,
            receSymbols: {} as Record<string, number>,
            serveSymbols: {} as Record<string, number>,
            colocacionSymbols: {} as Record<string, number>,
          };
        }
        const weightedKey = `${cat.key}Weighted`;
        const countKey = `${cat.key}Count`;
        byPlayer[player][weightedKey] = (byPlayer[player][weightedKey] || 0) + (val * cnt);
        byPlayer[player][countKey] = (byPlayer[player][countKey] || 0) + cnt;
        // accumulate symbol counts
        const symMapKey = `${cat.key}Symbols`;
        const mapRef: Record<string, number> = byPlayer[player][symMapKey] || {};
        mapRef[String(symbol) || ''] = (mapRef[String(symbol) || ''] || 0) + cnt;
        byPlayer[player][symMapKey] = mapRef;
      }
    }

    const rows = Object.values(byPlayer).map((p: any) => {
      const attackAvg = p.attackCount > 0 ? p.attackWeighted / p.attackCount : 0;
      const receAvg = p.receCount > 0 ? p.receWeighted / p.receCount : 0;
      const serveAvg = p.serveCount > 0 ? p.serveWeighted / p.serveCount : 0;
      const colocacionAvg = p.colocacionCount > 0 ? p.colocacionWeighted / p.colocacionCount : 0;
      return {
        player: p.player,
        attackAvg, attackCount: p.attackCount || 0,
        receAvg, receCount: p.receCount || 0,
        serveAvg, serveCount: p.serveCount || 0,
        colocacionAvg, colocacionCount: p.colocacionCount || 0,
        // detailed symbol counts for table
        receTotal: p.receCount || 0,
        receErr: (p.receSymbols && (p.receSymbols['='] || 0)) || 0,
        recePosPct: (p.receCount && ((p.receSymbols && (p.receSymbols['+'] || 0)) || 0) / p.receCount) || 0,
        recePerfPct: (p.receCount && ((p.receSymbols && (p.receSymbols['#'] || 0)) || 0) / p.receCount) || 0,
        serveTotal: p.serveCount || 0,
        serveErr: (p.serveSymbols && (p.serveSymbols['='] || 0)) || 0,
        servePts: (p.serveSymbols && (p.serveSymbols['#'] || 0)) || 0,
        attackTotal: p.attackCount || 0,
        attackErr: (p.attackSymbols && (p.attackSymbols['='] || 0)) || 0,
        attackBlock: (p.attackSymbols && (p.attackSymbols['/'] || 0)) || 0,
        attackPts: (p.attackSymbols && (p.attackSymbols['#'] || 0)) || 0,
        attackPtsPct: (p.attackCount && ((p.attackSymbols && (p.attackSymbols['#'] || 0)) || 0) / p.attackCount) || 0,
      };
    });

    // Sort by combined activity (sum of counts) desc
    return rows.sort((a, b) => (b.attackCount + b.receCount + b.serveCount + b.colocacionCount) - (a.attackCount + a.receCount + a.serveCount + a.colocacionCount));
  }

  // Columns used by the Material table (template reference)
  playersOverviewColumns: string[] = [
    'player',
    // Reception group
    'receTotal', 'receErr', 'recePosPct', 'recePerfPct',
    // Serve group
    'serveTotal', 'serveErr', 'servePts',
    // Attack group
    'attackTotal', 'attackErr', 'attackBlock', 'attackPts', 'attackPtsPct'
  ];
  // Top header row which defines group titles; these column defs are present only for header-row rendering
  headerRow1: string[] = ['player', 'receGroup', 'serveGroup', 'attackGroup'];
  get breakdownBySymbolPerPlayer(): { name: string; value: number }[] {
    // If API provides per-player symbol counts, prefer that and allow filtering
    const perPlayerRaw = this.reces?.perPlayer ?? this.reces?.perPlayerBreakdown ?? null;
    const perPlayer = Array.isArray(perPlayerRaw)
      ? perPlayerRaw
      : perPlayerRaw && typeof perPlayerRaw === 'object'
      ? Object.values(perPlayerRaw)
      : null;

    const mapSymbolToLabel = (symbol: string) => {
      switch (symbol) {
        case '#':
          return 'Rece Perfecta';
        case '+':
          return 'Rece Positiva';
        case '-':
          return 'Rece Negativa';
        case '/':
          return 'Rece Muy Negativa';
        case '=':
          return 'Error Recepción';
        default:
          return 'Otros Símbolos';
      }
    };

    // If perPlayer is available and is an array of { player: string, symbols: { '#':n, ... } }
    if (perPlayer && Array.isArray(perPlayer)) {
      // If a player is selected, return only that player's symbol breakdown
      if (this.receSelectedPlayer) {
        const found = perPlayer.find((p: any) => {
          const name = p.player ?? p.player_name ?? p.playerName ?? p.playerId ?? null;
          return name === this.receSelectedPlayer;
        });

        if (found && found.symbols && typeof found.symbols === 'object') {
          return Object.entries(found.symbols).map(([symbol, value]) => ({
            name: mapSymbolToLabel(symbol),
            value: Number(value) || 0,
          })).sort((a, b) => b.value - a.value);
        }

        // selected player not found -> return empty array
        return [];
      }

      // No player selected: return aggregated totals across all players (same shape as bySymbol)
      const agg: Record<string, number> = {};
      for (const p of perPlayer) {
        const symbols = p.symbols ?? {};
        for (const [sym, cnt] of Object.entries(symbols)) {
          agg[sym] = (agg[sym] || 0) + (Number(cnt) || 0);
        }
      }

      return Object.entries(agg).map(([symbol, value]) => ({
        name: mapSymbolToLabel(symbol),
        value: Number(value) || 0,
      })).sort((a, b) => b.value - a.value);
    }

    // Fallback: use top-level bySymbol if available (existing behavior)
    const symbolData = this.reces?.bySymbol ?? {};
    return Object.entries(symbolData)
      .map(([symbol, value]) => ({
        name: mapSymbolToLabel(symbol),
        value: Number(value) || 0,
      }))
      .sort((a, b) => b.value - a.value);
  }

  /**
   * Return an array of player names present in the perPlayer reception payload.
   * Used to populate the select control in the template.
   */
  get playersForRece(): string[] {
    const perPlayerRaw = this.reces?.perPlayer ?? null;
    const perPlayer = Array.isArray(perPlayerRaw)
      ? perPlayerRaw
      : perPlayerRaw && typeof perPlayerRaw === 'object'
      ? Object.values(perPlayerRaw)
      : null;

    if (!perPlayer || !Array.isArray(perPlayer)) return [];
    const names = perPlayer
      .map((p: any) => (p.player ?? p.player_name ?? p.playerName ?? p.playerId ?? '').toString())
      .filter((n: string) => n && n.length > 0);
    console.log('playersForRece', names);
    return Array.from(new Set(names));
  }

  onRecePlayerChange(event: Event) {
    const target = event.target as HTMLSelectElement | null;
    const val = target ? (target.value || null) : null;
    this.receSelectedPlayer = val;
  }

  /**
   * Package all derived outputs used by the resume view so they can be
   * passed to `DescargarResumenComponent` or emitted to a parent/dialog.
   */
  getExportPayload() {
    return {
      matchInfo: { id: this.matchId },
      saques: this.saques,
      reces: this.reces,
      ataques: this.ataques,
      colocacion: this.colocacion,
      // chart-friendly datasets
      playerAttackScores: this.playerAttackScores,
      playerReceScores: this.playerReceScores,
      playerScores: this.playerScores,
      playerColocacionScores: this.playerColocacionScores,
      breakdownBySymbol: this.breakdownBySymbol,
      breakdownBySymbolPerPlayer: this.breakdownBySymbolPerPlayer,
      // table rows
      playersOverview: this.playersOverview
    };
  }
  

}