import { Component } from '@angular/core';
import { AuthService } from '../../services/login.service'; // Servicio de autenticación
import { UserDataService } from '../../services/user-data.service'; // Servicio para manejar los datos del usuario

@Component({
  selector: 'app-personal-data',
  templateUrl: './personal-data.component.html',
  styleUrls: ['./personal-data.component.css']
})
export class PersonalDataComponent {
  userEmail: string | null = null;

  constructor(
    private authService: AuthService,
    private userDataService: UserDataService
  ) {
    // Obtener el correo electrónico del usuario logueado
    this.authService.getCurrentUser().subscribe(user => {
      this.userEmail = user?.email || null;
    });
  }

  saveForm(data: any) {
    // Agregar el correo electrónico del usuario al formulario
    if (this.userEmail) {
      data.email = this.userEmail;

      // Guardar los datos en la colección de Firebase
      this.userDataService.saveUserData(data).subscribe({
        next: () => alert('Datos guardados correctamente en Firebase.'),
        error: (err) => alert('Error al guardar los datos: ' + err)
      });
    } else {
      alert('No se pudo obtener el correo del usuario.');
    }
  }
}
