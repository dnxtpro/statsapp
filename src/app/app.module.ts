import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MarcadorComponent } from './marcador/marcador.component';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import { AddPlayerComponent } from './add-player/add-player.component';
import { ChoosePlayersComponent } from './choose-players/choose-players.component';
import { HomeComponent } from './home/home.component';
import { MatchDetailsComponent } from './match-details/match-details.component';
import { MatchDetailsXddComponent } from './match-details-xdd/match-details-xdd.component';
import { MatchLiveComponent } from './match-live/match-live.component';
import { ModelsComponent } from './models/models.component';
import { NewMatchComponent } from './new-match/new-match.component';
import { PlayerDetailsDialogComponent } from './player-details-dialog/player-details-dialog.component';
import { PlayerListComponent } from './player-list/player-list.component';
import { PlayerModalComponent } from './player-list-modal/player-list-modal.component';
import { DetailsPageComponent } from './details-page/details-page.component';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { SextetoComponent } from './sexteto/sexteto.component';
import { HttpClient } from '@angular/common/http';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SoniaComponent } from './sonia/sonia.component';
import { NgxEchartsModule,provideEcharts,NgxEchartsDirective } from 'ngx-echarts';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { httpInterceptorProviders} from './helpers/htttp.interceptor';
import { ProfileComponent } from './profile/profile.component';
import { BoardAdminComponent } from './board-admin/board-admin.component';
import { BoardModeratorComponent } from './board-moderator/board-moderator.component';
import { BoardUserComponent } from './board-user/board-user.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AddTeamComponent } from './add-team/add-team.component';
import { UserManagerComponent } from './user-manager/user-manager.component';
import { TeamsManagerComponent } from './teams-manager/teams-manager.component';
import { NewMatch1Component } from './new-match1/new-match1.component';
import { RoleDirective } from './role.directive';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {MatChipsModule} from '@angular/material/chips';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatListModule} from '@angular/material/list';
import { MatOptionModule } from '@angular/material/core';
import {CdkAccordionModule} from '@angular/cdk/accordion'; 
import {MatSelectModule} from '@angular/material/select';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatBadgeModule} from '@angular/material/badge';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {MatTable, MatTableModule} from '@angular/material/table';
import {MatTableDataSource} from '@angular/material/table';
import {ProgressBarMode, MatProgressBarModule} from '@angular/material/progress-bar';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import { MatSnackBarModule} from '@angular/material/snack-bar'
import { MatSnackBarConfig } from '@angular/material/snack-bar';


@NgModule({
  declarations: [
    AppComponent,
    MarcadorComponent,
    AddPlayerComponent,
    ChoosePlayersComponent,
    HomeComponent,
    MatchDetailsComponent,
    MatchDetailsXddComponent,
    MatchLiveComponent,
    ModelsComponent,
    NewMatchComponent,
    PlayerDetailsDialogComponent,
    PlayerListComponent,
    PlayerModalComponent,
    DetailsPageComponent,
    SextetoComponent,
    SoniaComponent,
    LoginComponent,
    RegisterComponent,
    ProfileComponent,
    BoardAdminComponent,
    BoardModeratorComponent,
    BoardUserComponent,
    AddTeamComponent,
    UserManagerComponent,
    TeamsManagerComponent,
    NewMatch1Component,
    RoleDirective,
    
  ],
  
  imports: [
MatChipsModule,
    CommonModule,
    RouterModule,
    BrowserModule,
    AppRoutingModule,
    MatDialogModule,
    RouterModule, 
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    DatePipe,
    NgxChartsModule,
    NgxEchartsModule,NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    NgxEchartsDirective,  
    MatSlideToggleModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatButtonToggleModule,
    MatListModule,
    MatInputModule,
    MatFormFieldModule,
    MatOptionModule,
    CdkAccordionModule,
    MatSelectModule,
    MatGridListModule,
    MatBadgeModule,
    ScrollingModule,
    MatSlideToggleModule,
    MatTableModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSnackBarModule,

  ],
  providers: [httpInterceptorProviders,provideEcharts(), provideAnimationsAsync(),provideHttpClient(withInterceptorsFromDi()), provideHttpClient(),
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
