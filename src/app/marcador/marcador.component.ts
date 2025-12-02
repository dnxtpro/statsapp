import { Component,OnInit,AfterViewInit,OnDestroy,ChangeDetectorRef } from '@angular/core';
import { MatchService } from '../services/match.service';
import { Router } from '@angular/router';
import { trigger,transition,style,animate,state } from '@angular/animations';
@Component({
  selector: 'app-marcador',
  templateUrl: './marcador.component.html',
  styleUrl: './marcador.component.css',
  animations: [
    trigger('parpadeoLocal', [
      state(
        'true',
        style({
          transform: 'scale(1.3)',
        })
      ),
      state(
        'false',
        style({
          transform: 'scale(1)',
        })
      ),
      transition('false <=> true', [
        animate('1000ms ease-in-out'),
      ]),
    ]),
    trigger('parpadeoVisitor', [
      state(
        'true',
        style({
          transform: 'scale(1.3)',
        })
      ),
      state(
        'false',
        style({
          transform: 'scale(1)',
        })
      ),
      transition('false <=> true', [
        animate('1000ms ease-in-out'),
      ]),
    ]),
  ],
  
})
export class MarcadorComponent implements AfterViewInit,OnInit,OnDestroy {
  marcador: any = [];
  parpadeoLocal = false;
  setsTotales:number =0;
  parpadeoVisitor = false;
  private intervalo: any;
  constructor(private matchService: MatchService, private router: Router,private cdRef:ChangeDetectorRef) {
    this.getMarcador();
  }
  ngOnInit(): void {
  this.getMarcador();
}
ngAfterViewInit(): void {
  this.intervalo = setInterval(() => {
   this.getMarcador();
  }, 5000);
  console.log('sale del bucle')

}

getMarcador() {
  const prevScoreLocal = this.marcador.scoreLocal;
  const prevScoreVisitor = this.marcador.scoreVisitor;

  this.matchService.getMarcador().subscribe((data) => {
    this.marcador = data;
    this.setsTotales= this.marcador.setsLocal + this.marcador.setsVisitor + 1;

    if (prevScoreLocal !== this.marcador.scoreLocal) {
      this.parpadeoLocal = true;
      setTimeout(() => {
        this.parpadeoLocal = false;
      }, 1500);
    }

    if (prevScoreVisitor !== this.marcador.scoreVisitor) {
      this.parpadeoVisitor = true;
      setTimeout(() => {
        this.parpadeoVisitor = false;
      }, 1500);
    }

    this.cdRef.detectChanges();
  });
}
parpadear(animation: 'parpadeoLocal' | 'parpadeoVisitor') {
  this[animation] = true;
  setTimeout(() => {
    this[animation] = false;
  }, 1500); // Duración total de la animación
}


  ngOnDestroy() {
    clearInterval(this.intervalo);
  }
}

