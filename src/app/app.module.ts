import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MarcadorComponent } from './marcador/marcador.component';
import { HttpClientModule } from '@angular/common/http';
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
import { DatePipe } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { SextetoComponent } from './sexteto/sexteto.component';
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
    SextetoComponent
  ],
  
  imports: [
    RouterModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatDialogModule,
    RouterModule, 
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatDialogModule, 
    ReactiveFormsModule,
    DatePipe,
    NgxChartsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
