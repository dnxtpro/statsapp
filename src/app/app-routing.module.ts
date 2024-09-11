import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NewMatchComponent } from './new-match/new-match.component';
import { MatchDetailsComponent } from './match-details/match-details.component';
import { PlayerListComponent } from './player-list/player-list.component';
import { AddPlayerComponent } from './add-player/add-player.component';
import { MatchLiveComponent } from './match-live/match-live.component';
import { DetailsPageComponent } from './details-page/details-page.component'; // Asumiendo que tienes un componente para los detalles de la página
import { MarcadorComponent } from './marcador/marcador.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { BoardAdminComponent } from './board-admin/board-admin.component';
import { LoginComponent } from './login/login.component';
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'new-match', component: NewMatchComponent },
  { path: 'match-details', component: MatchDetailsComponent },
  { path: 'player-list', component: PlayerListComponent },
  { path: 'add-player', component: AddPlayerComponent },
  { path: 'match-details', component: MatchDetailsComponent },
  { path: 'match-live', component: MatchLiveComponent },
  { path: 'match-details/:id', component: DetailsPageComponent },
  {path:'marcador', component:MarcadorComponent},
  {path:'register', component:RegisterComponent},
  {path:'admin', component:BoardAdminComponent},
  {path:'profile',component:ProfileComponent},
  {path:'login',component:LoginComponent},

  
  
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}