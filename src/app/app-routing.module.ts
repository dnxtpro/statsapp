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
import { AddTeamComponent } from './add-team/add-team.component';
import { UserManagerComponent } from './user-manager/user-manager.component';
import { NewMatch1Component } from './new-match1/new-match1.component';
import { TeamsManagerComponent } from './teams-manager/teams-manager.component';
import { EditorComponent } from './editor/editor.component';
import { YoutubePlayerComponent } from './youtube-player/youtube-player.component';
import	{RewardComponent}	from	'./reward/reward.component';
import { EntrenadorGuard } from './entrenador.guard';
import { RoleGuard } from './auth/role.guard';
import { CanvasComponent } from './canvas/canvas.component';
import { FirstComponent } from './first/first.component';
const routes: Routes = [
  { path: '', component: FirstComponent },
  { path: 'home', component: HomeComponent },
  { path: 'new-match', component: NewMatchComponent,canActivate:[EntrenadorGuard] },
  {path:'new-match1',component:NewMatch1Component},
  { path: 'match-details', component: MatchDetailsComponent },
  { path: 'player-list', component: PlayerListComponent,canActivate:[EntrenadorGuard] },
  { path: 'add-player', component: AddPlayerComponent,canActivate:[EntrenadorGuard] },
  { path: 'match-details', component: MatchDetailsComponent },
  { path: 'match-live', component: MatchLiveComponent,canActivate:[EntrenadorGuard] },
  { path: 'match-live/:id', component: MatchLiveComponent,canActivate:[EntrenadorGuard] },
  { path: 'match-details/:id', component: DetailsPageComponent },
  {path:'marcador', component:MarcadorComponent},
  {path:'register', component:RegisterComponent},
  {path:'admin', component:BoardAdminComponent},
  {path:'profile',component:ProfileComponent},
  {path:'login',component:LoginComponent},
  {path:'add-team',component:AddTeamComponent,canActivate:[EntrenadorGuard]},
  {path:'users',component:UserManagerComponent,canActivate: [RoleGuard] },
  {path:'error-505',component:TeamsManagerComponent},
  {path:'editor/:id',component:EditorComponent},
  {path:'youtube',component:YoutubePlayerComponent},
  {path:'reward',component:RewardComponent},
  {path:'canvas',component:CanvasComponent} 


  
  
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}