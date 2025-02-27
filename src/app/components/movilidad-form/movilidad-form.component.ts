import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/login.service';
import { UserDataService } from '../../services/user-data.service';

@Component({
  selector: 'app-movilidad-form',
  templateUrl: './movilidad-form.component.html',
  styleUrls: ['./movilidad-form.component.css']
})
export class MovilidadFormComponent implements OnInit {
  userEmail: string | null = null;
  userRole: string | null = null;
  isAdmin: boolean = false;
  selectedUserEmail: string | null = null;  // Email del usuario de los queryParams (si es admin)

  formData = {
    facultad: '',
    semestre: '',
    promedio: '',
    periodoMovilidad: '',
    tipoMovilidad: '',
    contactoEmergencia: '',
    universidadDestino: '',
    titulacionDestino: '',
    periodoDestino: '',
    paisDestino: '',
    declaracion: false
  };

  hasData: boolean = false;

  constructor(
    private authService: AuthService,
    private userDataService: UserDataService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.userEmail = user?.email || null;
      this.route.queryParams.subscribe(params => {
        this.selectedUserEmail = params['userEmail'] || null;

        if (this.userEmail) {
          this.loadUserRole();
        }
      });
    });
  }

  loadUserRole(): void {
    if (this.userEmail) {
      this.userDataService.getUserRole(this.userEmail).subscribe({
        next: (role: string | null) => {
          this.userRole = role ?? 'user';
          this.isAdmin = this.userRole === 'admin';
          this.loadUserData();
        },
        error: (err: any) => console.error('Error al obtener el rol:', err)
      });
    }
  }

  loadUserData(): void {
    let emailToLoad = this.isAdmin && this.selectedUserEmail ? this.selectedUserEmail : this.userEmail;

    if (emailToLoad) {
      this.userDataService.getUserData(emailToLoad).subscribe({
        next: (data: any) => {
          if (data) {
            this.formData = { ...data };
            this.hasData = true;
          } else {
            this.hasData = false;
          }
        },
        error: (err: any) => console.error('Error al cargar datos:', err)
      });
    }
  }

  saveOrUpdateForm(): void {
    if (this.isAdmin) {
      // Si es admin, no debe guardar los datos. Solo se pueden ver
      return;
    }

    let emailToSave: string = (this.isAdmin && this.selectedUserEmail ? this.selectedUserEmail : this.userEmail) as string;

    if (!emailToSave) {
      console.error('Error: No se puede guardar porque el email es null.');
      return;
    }

    const userData = {
      ...this.formData,
      email: emailToSave,
      proceso: 'outgoing',
    };

    if (this.hasData) {
      // Si el usuario no es admin, guardar los datos
      this.userDataService.updateUserData(emailToSave, userData).subscribe({
        next: () => this.updateUserProcess(emailToSave),
        error: (err: any) => alert('Error al actualizar los datos: ' + err.message)
      });
    } else {
      // Si el usuario no es admin y no hay datos, guardarlos
      this.userDataService.saveUserData(userData).subscribe({
        next: () => this.updateUserProcess(emailToSave),
        error: (err: any) => alert('Error al guardar los datos: ' + err.message)
      });
    }
  }

  updateUserProcess(email: string): void {
    if (!email) {
      console.error('Error: No se puede actualizar el proceso porque el email es null.');
      return;
    }

    // Verificar si el documento existe antes de intentar actualizar
    this.userDataService.getUserData(email).subscribe({
      next: (data: any) => {
        if (data) {
          // Si el documento existe, se actualiza
          this.userDataService.updateUserProcess(email, 'outgoing').subscribe({
            error: (err: any) => console.error('Error al actualizar el proceso del usuario:', err)
          });
        } else {
          // Si el documento no existe, crearlo o manejar el error
          console.error('Error: El documento del usuario no existe.');
          // Opcionalmente puedes crear un documento nuevo si lo deseas:
          this.userDataService.saveUserData({ email, proceso: 'outgoing' }).subscribe({
            next: () => console.log('Documento creado con éxito.'),
            error: (err: any) => console.error('Error al crear el documento del usuario:', err)
          });
        }
      },
      error: (err: any) => console.error('Error al verificar la existencia del documento:', err)
    });
  }
}
