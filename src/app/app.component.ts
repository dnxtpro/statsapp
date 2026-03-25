import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { StorageService } from './_services/storage.service';
import { AuthService } from './_services/auth.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import {
  trigger,
  transition,
  style,
  query,
  group,
  animate,
  animateChild,
} from '@angular/animations';
import { Router } from '@angular/router';
import { MatchService } from './services/match.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        style({ position: 'relative' }),
        query(
          ':enter, :leave',
          [
            style({
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              opacity: 0,
              transform: 'scale(0) translateY(100%)',
            }),
          ],
          { optional: true }
        ),
        query(
          ':enter',
          [
            animate(
              '600ms ease',
              style({ opacity: 1, transform: 'scale(1) translateY(0)' })
            ),
          ],
          { optional: true }
        ),
        query(
          ':leave',
          [
            animate(
              '600ms ease',
              style({ opacity: 0, transform: 'scale(0) translateY(-100%)' })
            ),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isLandingPage: boolean = false;
  title = 'lawea';
  private roles: string[] = [];
  isLoggedIn = false;
  showAdminBoard = false;
  showModeratorBoard = false;
  username?: string;
  currentUser: any;
  isAdmin = false;
  currentTeam: any;
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  isMobile = true;
  reward :boolean = false;

  isCollapsed = true;

  sidebarAbierto = false;
  constructor(
    private router: Router,
    private storageService: StorageService,
    private observer: BreakpointObserver,
    private authService: AuthService,
    private matchService: MatchService
  ) {}
  ngOnInit(): void {
    
    this.observer.observe(['(max-width: 800px)']).pipe(takeUntil(this.destroy$)).subscribe((screenSize) => {
      if (screenSize.matches) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.isLandingPage = this.router.url === '/';
    });
    this.currentUser = this.storageService.getUser();
    this.isLoggedIn = this.storageService.isLoggedIn();

    if (this.isLoggedIn) {
      const user = this.storageService.getUser();
      this.roles = user.roles;

      this.showAdminBoard = this.roles.includes('ROLE_ADMIN');
      this.showModeratorBoard = this.roles.includes('ROLE_ENTRENADOR');

      this.username = user.username;
    }
    this.matchService.obtenerEquipos().pipe(takeUntil(this.destroy$)).subscribe(
      (data) => {
        console.log('Datos recibidos:', data);
        this.currentTeam = data;
      },
      (error) => {
        console.error('Error al obtener los datos:', error);
      })
  
  }

  logout(): void {
    this.authService.logout().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        console.log(res);
        this.storageService.clean();

        window.location.reload();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  toggleSideBar() {
    if (this.isMobile) {
      this.sidenav.toggle();
      this.isCollapsed = false; // On mobile, the menu can never be collapsed
    } else {
      this.sidenav.open(); // On desktop/tablet, the menu can never be fully closed
      this.isCollapsed = !this.isCollapsed;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
