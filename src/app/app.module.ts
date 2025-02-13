import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import {RouterLink, RouterModule, RouterOutlet, Routes} from "@angular/router";
import { HomeComponent } from './components/home/home.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoginComponent } from './components/login/login.component';
import {FormsModule} from "@angular/forms";
import { PersonalDataComponent } from './components/personal-data/personal-data.component';
import {AuthGuard} from "./guards/auth.guard";
import { UniversityDataComponent } from './components/university-data/university-data.component';
import { CartaAceptacionComponent } from './components/carta-aceptacion/carta-aceptacion.component';
import { RequirementsComponent } from './components/requirements/requirements.component';
import { RequirementsOutComponent } from './components/requirements-out/requirements-out.component';
import { ConvocatoriasComponent } from './components/convocatorias/convocatorias.component';


const appRoutes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: '', component: HomeComponent},
  {path: 'login', component: LoginComponent},
  { path: 'personal-data', component: PersonalDataComponent, canActivate: [AuthGuard] },
  { path: 'university-data', component: UniversityDataComponent, canActivate: [AuthGuard] },
  { path: 'carta-aceptacion', component: CartaAceptacionComponent, canActivate: [AuthGuard] },
  {path: 'requirements', component: RequirementsComponent},
  {path: 'requirements-out', component: RequirementsOutComponent},
  {path: 'convocatorias', component: ConvocatoriasComponent},
];
@NgModule({
  declarations: [AppComponent, HomeComponent, HeaderComponent, FooterComponent, LoginComponent, PersonalDataComponent, UniversityDataComponent, CartaAceptacionComponent, RequirementsComponent, RequirementsOutComponent, ConvocatoriasComponent],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    RouterOutlet,
    RouterModule.forRoot(appRoutes),
    RouterLink,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
