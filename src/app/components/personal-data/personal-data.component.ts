import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/login.service';
import { UserDataService } from '../../services/user-data.service';

@Component({
  selector: 'app-personal-data',
  templateUrl: './personal-data.component.html',
  styleUrls: ['./personal-data.component.css']
})
export class PersonalDataComponent implements OnInit {
  userEmail: string | null = null;
  userRole: string | null = null; // Nuevo: Guardará el rol del usuario
  isAdmin: boolean = false; // Nuevo: Indica si el usuario es admin
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
  };

  hasData: boolean = false; // Indica si ya existen datos en Firebase

  constructor(
    private authService: AuthService,
    private userDataService: UserDataService
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.userEmail = user?.email || null;
      if (this.userEmail) {
        this.loadUserData();
        this.loadUserRole();
      }
    });
  }

  loadUserRole(): void {
    if (this.userEmail) {
      this.userDataService.getUserRole(this.userEmail).subscribe({
        next: (role: string | null) => { // Ajustamos el tipo para aceptar `null`
          this.userRole = role ?? 'user'; // Si es `null`, asignamos 'user' por defecto
          this.isAdmin = this.userRole === 'admin'; // Evaluamos si es admin
        },
        error: (err: any) => {
          console.error('Error al obtener el rol del usuario:', err);
        }
      });
    }
  }



  loadUserData(): void {
    if (this.userEmail) {
      this.userDataService.getUserData(this.userEmail).subscribe({
        next: (data: any) => {
          if (data) {
            this.formData = { ...data };
            this.hasData = true;
          }
        },
        error: (err: any) => {
          console.error('Error al cargar los datos:', err);
        }
      });
    }
  }

  saveOrUpdateForm(): void {
    if (this.userEmail) {
      const userData = {
        ...this.formData,
        email: this.userEmail,
      };

      if (this.hasData) {
        this.userDataService.updateUserData(this.userEmail, userData).subscribe({

          error: (err: any) => {
            alert('Error al actualizar los datos: ' + err.message);
          }
        });
      } else {
        this.userDataService.saveUserData(userData).subscribe({

          error: (err: any) => {
            alert('Error al guardar los datos: ' + err.message);
          }
        });
      }
    }
  }

}
