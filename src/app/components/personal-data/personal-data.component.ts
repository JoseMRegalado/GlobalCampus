import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/login.service';
import { UserDataService } from '../../services/user-data.service';
import {AlertaService} from "../../services/alert.service";

@Component({
  selector: 'app-personal-data',
  templateUrl: './personal-data.component.html',
  styleUrls: ['./personal-data.component.css']
})
export class PersonalDataComponent implements OnInit {
  userEmail: string | null = null; // Email del usuario autenticado
  userRole: string | null = null; // Rol del usuario autenticado
  isAdmin: boolean = false; // Indica si es admin
  selectedUserEmail: string | null = null; // Email del usuario seleccionado (para admin)

  formData = {
    lastName: '',
    firstName: '',
    birthPlace: '',
    birthDate: '',
    gender: '',
    idNumber: '',
    idExpiry: '',
    nationality: '',
    phone: '',
    politica: false,
  };

  hasData: boolean = false; // Indica si ya existen datos en Firebase

  constructor(
    private authService: AuthService,
    private userDataService: UserDataService,
    private route: ActivatedRoute,
    private alertaService: AlertaService
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.userEmail = user?.email || null;

      // 1️⃣ Obtener el email del usuario seleccionado desde la URL (si lo hay)
      this.route.queryParams.subscribe(params => {
        this.selectedUserEmail = params['userEmail'] || null;

        // 2️⃣ Una vez que tenemos los datos, obtenemos el rol
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
          this.userRole = role ?? 'user'; // Si no tiene rol, es "user"
          this.isAdmin = this.userRole === 'admin';

          // 4️⃣ AHORA sí podemos decidir qué datos cargar
          this.loadUserData();
        },
        error: (err: any) => {
          console.error('Error al obtener el rol del usuario:', err);
        }
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
            this.hasData = false; // Si no hay datos, permite guardarlos
          }
        },
        error: (err: any) => {
          console.error('Error al cargar los datos:', err);
        }
      });
    }
  }

  isFormValid(): boolean {
    for (const key in this.formData) {
      if (Object.prototype.hasOwnProperty.call(this.formData, key)) {
        const value = this.formData[key as keyof typeof this.formData];
        if (typeof value === 'boolean') {
          if (!value) return false; // campos booleanos deben ser true
        } else {
          if (!value || value.trim() === '') return false; // strings no vacíos
        }
      }
    }
    return true;
  }



  saveOrUpdateForm(): void {
    let emailToSave = this.isAdmin && this.selectedUserEmail ? this.selectedUserEmail : this.userEmail;

    if (emailToSave) {
      const userData = {
        ...this.formData,
        email: emailToSave,
      };

      if (this.hasData) {
        this.userDataService.updateUserData(emailToSave, userData).subscribe({
          error: (err: any) => {
            this.alertaService.mostrarAlerta(
              'error',
              'Error al actualizar',
              'Hubo un error al actualizar el documento: ' + err.message
            );
          }
        });
      } else {
        this.userDataService.saveUserData(userData).subscribe({
          error: (err: any) => {
            this.alertaService.mostrarAlerta(
              'error',
              'Datos no guardados.',
              'Error al guardar los datos: ' + err.message
            );
          }
        });
      }
    }
  }
}
