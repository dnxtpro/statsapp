import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MarcadorComponent } from './marcador/marcador.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
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
import { QRCodeModule } from 'angularx-qrcode';
import { SoniaComponent } from './sonia/sonia.component';
import { NgxEchartsModule,provideEcharts,NgxEchartsDirective } from 'ngx-echarts';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { httpInterceptorProviders} from './helpers/htttp.interceptor';
import { ProfileComponent } from './profile/profile.component';
import { BoardAdminComponent } from './board-admin/board-admin.component';
import { BoardModeratorComponent } from './board-moderator/board-moderator.component';
import { BoardUserComponent } from './board-user/board-user.component';
import { ApexChart,NgApexchartsModule } from 'ng-apexcharts';
import { AddTeamComponent } from './add-team/add-team.component';
import { UserManagerComponent } from './user-manager/user-manager.component';
import { TeamsManagerComponent } from './teams-manager/teams-manager.component';
import { NewMatch1Component } from './new-match1/new-match1.component';
import { RoleDirective } from './role.directive';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';



@NgModule({ declarations: [
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
    bootstrap: [AppComponent], imports: [RouterModule,
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        MatDialogModule,
        RouterModule,
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        BrowserAnimationsModule,
        MatDialogModule,
        ReactiveFormsModule,
        DatePipe,
        NgxChartsModule,
        QRCodeModule,
        NgxEchartsModule, NgxEchartsModule.forRoot({
            echarts: () => import('echarts')
        }),
        NgxEchartsDirective,
        NgApexchartsModule], providers: [httpInterceptorProviders, provideEcharts(), provideAnimationsAsync(), provideHttpClient(withInterceptorsFromDi())] })
export class AppModule { }
