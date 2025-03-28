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
  constructor(
    private fb: FormBuilder,
    private userDataService: UserDataService,
    private dialogRef: MatDialogRef<EncuestaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { email: string, proceso: string, soloLectura: boolean }
  ) {this.proceso = data.proceso;
    this.soloLectura = data.soloLectura;}

  ngOnInit(): void {
    // 🔹 Inicializa el formulario vacío para evitar el error en la vista
    this.encuestaForm = this.fb.group({
      nombre: [''],
      universidad: [''],
      carrera: [''],
      tipoMovilidad: [''],
      pais: [''],
      periodo: [''],
      motivacion: [''],
      culminoConExito: [''],
      superoExpectativas: [''],
      explicacion: [''],
      positivos: [''],
      negativos: [''],
      aspectosExtra: [''],
      apoyoDestino: [''],
      accesoPlataforma: [''],
      calidadClases: [''],
      valoracionEstancia: [''],
      apoyoUTPL: [''],
      homologacionCreditos: [''],
      orientacionApoyo: [''],
      medioConocimiento: [''],
      postulariaNuevamente: [''],
      explicacionPostulacion: ['']
    });

    // 🔹 Ahora carga los datos desde Firebase
    this.userDataService.getUserData(this.data.email).subscribe(user => {
      this.userDataService.getUniversityData(this.data.email).subscribe(uni => {
        this.encuestaForm.patchValue({ // Usa patchValue para actualizar solo los campos necesarios
          nombre: user.nombre,
          universidad: uni.universidad,
          carrera: user.carrera,
          tipoMovilidad: user.tipoMovilidad,
          pais: user.pais,
          periodo: user.periodo
        });
      });
    });
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
}
