import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserDataService } from 'src/app/services/user-data.service';

interface Pregunta {
  name: string;
  label: string;
  type: 'text' | 'select'| 'options';
  subtitle?: string;
}

@Component({
  selector: 'app-encuesta-modal',
  templateUrl: './encuesta-modal.component.html',
  styleUrls: ['./encuesta-modal.component.css']
})
export class EncuestaModalComponent implements OnInit {
  encuestaForm!: FormGroup;
  proceso!: string;
  soloLectura: boolean = false;

  // Navegación por páginas
  preguntas: Pregunta[] = [];
  preguntasVisibles: Pregunta[] = [];
  paginaActual: number = 0;
  totalPages: number = 0;
  preguntasPorPagina: number = 5;

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


    const preguntasOutgoing: Pregunta[] = [
      { subtitle: 'Motivación', name: 'aportaciones', label: '¿Qué aportaciones obtuvo de la experiencia?', type: 'text' },
      { name: 'dificultades', label: '¿Qué dificultades enfrentó durante su intercambio?', type: 'text' }
    ];

    const preguntasIncoming: Pregunta[] = [
      { subtitle: 'Motivación',name: 'integracion', label: '¿Cuál fue su principal motivación para realizar una estancia en la UTPL?', type: 'text' },
      { subtitle: 'Expectativa vs Realidad en la UTPL.',name: 'apoyoInstitucional', label: '¿Culminó con éxito su estancia en la UTPL? (aprobación de materias)? ', type: 'select' },
      { name: 'superoExpectativas', label: '¿Esta experiencia internacional superó sus expectativas académicas?', type: 'select' },
      { name: 'explicacionExperiencia', label: 'Explicar la respuesta anterior', type: 'text' },
      { name: 'aspectosPostivos', label: 'Describa al menos 2 aspectos positivos de su estancia en UTPL.', type: 'text' },
      { name: 'aspectosNegativos', label: 'Describa al menos 2 aspectos negativos de su estancia en UTPL.', type: 'text' },
      { name: 'aspectosExtracademicos', label: 'Escoja uno o varios aspectos extra-académicos adquiridos durante la estancia:', type: 'text' },
      { name: 'explicacionAspectos', label: 'Explicar la respuesta anterior', type: 'text' },
      { subtitle: 'Procesos',name: 'escalaApoyo', label: 'El apoyo brindado por la UTPL a través de la oficina de relaciones interinstitucionales durante y después de su intercambio fue:', type: 'options' },
      { name: 'escalaPlataforma', label: 'El acceso a la plataforma tecnológica y a los recursos de estudio fue:', type: 'options' },
      { name: 'escalaClases', label: '¿Cómo calificaría la calidad de las clases impartidas: metodologías de estudio, tutorías y metodología de evaluación?', type: 'options' },
      { name: 'escalaEstancia', label: 'En términos generales la valoración académica de su estancia en la UTPL fue:', type: 'options' },
      { subtitle: 'Información adicional',name: 'medioComunicacion', label: '¿Por qué medio tuvo conocimiento del programa de intercambio en UTPL?', type: 'text' },
      { name: 'repetiria', label: '¿Postularía nuevamente para una estancia en la UTPL? ', type: 'select' },











    ];

    // Asignar preguntas según proceso
    this.preguntas = this.proceso === 'outgoing' ? preguntasOutgoing : preguntasIncoming;

    // Agregar controles al formulario
    this.preguntas.forEach(p => {
      this.encuestaForm.addControl(p.name, this.fb.control(''));
    });

    // Calcular paginación
    this.totalPages = Math.ceil(this.preguntas.length / this.preguntasPorPagina);
    this.actualizarPreguntasVisibles();

    this.cargarDatosUsuario();
  }

  actualizarPreguntasVisibles() {
    const inicio = this.paginaActual * this.preguntasPorPagina;
    const fin = inicio + this.preguntasPorPagina;
    this.preguntasVisibles = this.preguntas.slice(inicio, fin);
  }

  paginaSiguiente() {
    if (this.paginaActual < this.totalPages - 1) {
      this.paginaActual++;
      this.actualizarPreguntasVisibles();
    }
  }

  paginaAnterior() {
    if (this.paginaActual > 0) {
      this.paginaActual--;
      this.actualizarPreguntasVisibles();
    }
  }

  submitSurvey(): void {
    if (this.soloLectura) {
      alert('Solo lectura. No se puede enviar.');
      return;
    }

    const surveyData = { ...this.encuestaForm.value };
    Object.keys(surveyData).forEach(key => {
      if (surveyData[key] === undefined) {
        surveyData[key] = "";
      }
    });

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
