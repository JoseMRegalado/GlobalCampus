import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {AuthService} from "../../services/login.service";
import {UserDataService} from "../../services/user-data.service";
import { Subscription, switchMap, of, combineLatest } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-process-status',
  templateUrl: './process-status.component.html',
  styleUrls: ['./process-status.component.css']
})
export class ProcessStatusComponent implements OnInit, OnDestroy {
  userData: any = null; // Para almacenar los datos del usuario
  isLoading: boolean = true;
  errorMessage: string | null = null;
  private currentUserSubscription: Subscription | null = null;
  userEmail: string | null = null;

  constructor(
    private authService: AuthService,
    private userDataService: UserDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUserSubscription = this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (user && user.email) {
          this.userEmail = user.email;

          // Combinar observables para obtener datos personales y universitarios
            return combineLatest([
            this.userDataService.getUserData(user.email).pipe(catchError(() => of(null))), // Manejar error si no hay datos personales
            this.userDataService.getUniversityData(user.email).pipe(catchError(() => of(null))), // Manejar error si no hay datos universitarios
            this.userDataService.getUserData1(user.email).pipe(catchError(() => of({ proceso: 'N/A' }))), // Obtener 'proceso'
            this.userDataService.getUserData2(user.email).pipe(catchError(() => of({ comentario: 'N/A' }))) // Obtener 'comentario'
          ]).pipe(
            map(([personalData, universityData, processData, comentarioData]) => {
              // Construir el objeto userData combinando la información
              return {
                ...personalData, // Incluye id, firstName, lastName, email, etc.
                universityName: universityData?.universityName || 'N/A',
                period: universityData?.period || 'N/A',
                proceso: processData?.proceso || 'N/A', // Asegura que 'proceso' esté presente
                comentario: comentarioData?.comentario || 'N/A',
              };
            })
          );
        } else {
          // No hay usuario logueado o no tiene email
          this.errorMessage = 'Usuario no autenticado.';
          return of(null); // Devuelve un observable nulo
        }
      }),
      catchError(error => {
        console.error('Error obteniendo datos del usuario:', error);
        this.errorMessage = 'Error al cargar los datos del proceso.';
        return of(null); // Manejo de errores en la cadena
      })
    ).subscribe(data => {
      this.userData = data;
      this.isLoading = false;
      if (!data && !this.errorMessage) {
        this.errorMessage = 'No se encontraron datos para este usuario.';
      }
    });
  }

  ngOnDestroy(): void {
    this.currentUserSubscription?.unsubscribe();
  }

  continueProcess(): void {
    if (this.userEmail) {
      // Navega a personal-data. Puedes pasar el email si es necesario,
      // aunque el componente personal-data probablemente también use AuthService.
      this.router.navigate(['/docs']);
      // O si necesitas pasar el email como parámetro (ej, si personal-data no usa AuthService):
      // this.router.navigate(['/personal-data'], { queryParams: { userEmail: this.userEmail } });
    } else {
      this.errorMessage = "No se puede continuar el proceso sin un usuario identificado.";
    }
  }
}
