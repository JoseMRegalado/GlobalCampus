import { CUSTOM_ELEMENTS_SCHEMA,NgModule } from '@angular/core';
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
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { PersonalDataComponent } from './components/personal-data/personal-data.component';
import {AuthGuard} from "./guards/auth.guard";
import { UniversityDataComponent } from './components/university-data/university-data.component';
import { CartaAceptacionComponent } from './components/carta-aceptacion/carta-aceptacion.component';
import { RequirementsComponent } from './components/requirements/requirements.component';
import { RequirementsOutComponent } from './components/requirements-out/requirements-out.component';
import { ConvocatoriasComponent } from './components/convocatorias/convocatorias.component';
import { DocumentosComponent } from './components/documentos/documentos.component';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
import  {register} from 'swiper/element/bundle';
import { ConvocatoriaDetalleComponent } from './components/convocatoria-detalle/convocatoria-detalle.component';
import {MatMenuModule} from "@angular/material/menu";
import {MatIconModule} from "@angular/material/icon";
import { AdminViewComponent } from './components/admin-view/admin-view.component';
import { BarComponent } from './components/bar/bar.component';
import { MovilidadFormComponent } from './components/movilidad-form/movilidad-form.component';
import { MatDialogModule } from '@angular/material/dialog';
import { EncuestaModalComponent } from './components/encuesta-modal/encuesta-modal.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ProcessStatusComponent } from './components/process-status/process-status.component';
import { AlertaComponent } from './components/alerta/alerta.component';
import { EstadisticasComponent } from './components/estadisticas/estadisticas.component';
import {BaseChartDirective} from "ng2-charts";


register();


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
  {path: 'docs', component: DocumentosComponent},
  { path: 'convocatoria-detalle', component: ConvocatoriaDetalleComponent },
  {path: 'admin', component: AdminViewComponent},
  { path: 'personal-data/:email', component: PersonalDataComponent },
  { path: 'docs/:email', component: DocumentosComponent },
  { path: 'out/:email', component: MovilidadFormComponent },
  { path: 'out', component: MovilidadFormComponent },
  { path: 'process-status', component: ProcessStatusComponent },
  { path: 'stats', component: EstadisticasComponent },
];
@NgModule({
  declarations: [AppComponent, HomeComponent, HeaderComponent, FooterComponent, LoginComponent, PersonalDataComponent, UniversityDataComponent, CartaAceptacionComponent, RequirementsComponent, RequirementsOutComponent, ConvocatoriasComponent, DocumentosComponent, ProgressBarComponent, ConvocatoriaDetalleComponent, AdminViewComponent, BarComponent, MovilidadFormComponent, EncuestaModalComponent, ProcessStatusComponent, AlertaComponent, EstadisticasComponent],
    imports: [
        BrowserModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireAuthModule,
        AngularFirestoreModule,
        RouterOutlet,
        RouterModule.forRoot(appRoutes),
        RouterLink,
        FormsModule,
        MatMenuModule,
        MatIconModule,
        ReactiveFormsModule,
        MatDialogModule,
        NoopAnimationsModule,
        BaseChartDirective,
    ],
  providers: [],
  bootstrap: [AppComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
