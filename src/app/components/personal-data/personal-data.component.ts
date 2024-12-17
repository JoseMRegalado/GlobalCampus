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
      }
    });
  }

  loadUserData() {
    if (this.userEmail) {
      this.userDataService.getUserData(this.userEmail).subscribe(data => {
        if (data) {
          this.formData = data; // Cargar los datos del documento correspondiente
          this.hasData = true;
        }
      });
    }
  }

  saveOrUpdateForm() {
    if (this.userEmail) {
      const userData = {
        ...this.formData,
        email: this.userEmail, // Agregar el correo al objeto de datos
      };

      if (this.hasData) {
        this.userDataService.updateUserData(this.userEmail, userData).subscribe({
          next: () => alert('Datos actualizados correctamente.'),
          error: (err) => alert('Error al actualizar los datos: ' + err),
        });
      } else {
        this.userDataService.saveUserData(userData).subscribe({
          next: () => alert('Datos guardados correctamente.'),
          error: (err) => alert('Error al guardar los datos: ' + err),
        });
      }
    }
  }

}
