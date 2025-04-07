import {Component, Inject, Input, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserDataService } from 'src/app/services/user-data.service';

@Component({
  selector: 'app-encuesta-modal',
  templateUrl: './encuesta-modal.component.html',
  styleUrls: ['./encuesta-modal.component.css']
})
export class EncuestaModalComponent implements OnInit {
  encuestaForm!: FormGroup;
  proceso!: string;
  soloLectura: boolean = false;

  userEmail: string = '';  // Aquí debes obtener el email del usuario autenticado
  encuestaData: any = {
    nombres: '',
    universidad: '',
    carrera: '',
    tipoMovilidad: '',
    pais: '',
    periodoIntercambio: ''

  };

  constructor(
    private fb: FormBuilder,
    private userDataService: UserDataService,
    private dialogRef: MatDialogRef<EncuestaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { email: string, proceso: string, soloLectura: boolean }
  ) {
    this.proceso = data.proceso;
    this.soloLectura = data.soloLectura;
  }

  ngOnInit() {
    this.encuestaForm = this.fb.group({
      nombres: [''],
      universidad: [''],
      carrera: [''],
      tipoMovilidad: [''],
      pais: [''],
      periodoIntercambio: ['']
    });

    this.cargarDatosUsuario();
  }


  submitSurvey(): void {

    if (this.soloLectura) {
      alert('Solo lectura. No se puede enviar.');
      return;
    }
    // 🔹 Asegurar que ningún campo sea undefined antes de enviar
    const surveyData = {
      ...this.encuestaForm.value, // Copia los valores actuales del formulario
    };

    // 🔹 Reemplazar undefined con un string vacío
    Object.keys(surveyData).forEach(key => {
      if (surveyData[key] === undefined) {
        surveyData[key] = "";
      }
    });

    // 🔹 Guardar en Firebase
    this.userDataService.saveSurvey(this.data.email, surveyData).subscribe({
      next: () => {
        alert('Encuesta guardada exitosamente');
        this.dialogRef.close();
      },
      error: err => alert('Error al guardar la encuesta: ' + err)
    });
  }


  closeDialog(): void {
    this.dialogRef.close();
  }

  cargarDatosUsuario() {
    if (!this.data.email) {
      console.warn('No se encontró el correo del usuario.');
      return;
    }

    this.userDataService.getUserData(this.data.email).subscribe(userData => {
      if (!userData) {
        console.warn('No se encontraron datos personales del usuario.');
        return;
      }

      this.userDataService.getUniversityData(this.data.email).subscribe(universityData => {
        if (!universityData) {
          console.warn('No se encontraron datos universitarios del usuario.');
          return;
        }

        // Asignar los valores al formulario
        this.encuestaForm.patchValue({
          nombres: `${userData.firstName} ${userData.lastName}`,
          universidad: universityData.universityName,
          carrera: universityData.faculty,
          tipoMovilidad: universityData.mobilityType,
          pais: universityData.universityCountry,
          periodoIntercambio: universityData.period
        });
      });
    });
  }
}
