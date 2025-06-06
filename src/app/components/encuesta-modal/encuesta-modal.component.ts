import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserDataService } from 'src/app/services/user-data.service';
import {AlertaService} from "../../services/alert.service";

interface Pregunta {
  name: string;
  label: string;
  type: 'text' | 'select'| 'options'| 'comunicacion'| 'aspectos';
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
  showAlerta = false;

  preguntas: Pregunta[] = [];
  preguntasVisibles: Pregunta[] = [];
  paginaActual: number = 0;
  preguntasPorPagina: number = 5;

  constructor(
    private fb: FormBuilder,
    private userDataService: UserDataService,
    private dialogRef: MatDialogRef<EncuestaModalComponent>,
    private alertaService: AlertaService,
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
      { name: 'aspectosExtracademicos', label: 'Escoja uno o varios aspectos extra-académicos adquiridos durante la estancia:', type: 'aspectos' },
      { name: 'explicacionAspectos', label: 'Explicar la respuesta anterior', type: 'text' },
      { subtitle: 'Procesos',name: 'escalaApoyo', label: 'El apoyo brindado por la UTPL a través de la oficina de relaciones interinstitucionales durante y después de su intercambio fue:', type: 'options' },
      { name: 'escalaPlataforma', label: 'El acceso a la plataforma tecnológica y a los recursos de estudio fue:', type: 'options' },
      { name: 'escalaClases', label: '¿Cómo calificaría la calidad de las clases impartidas: metodologías de estudio, tutorías y metodología de evaluación?', type: 'options' },
      { name: 'escalaEstancia', label: 'En términos generales la valoración académica de su estancia en la UTPL fue:', type: 'options' },
      { subtitle: 'Información adicional',name: 'medioComunicacion', label: '¿Por qué medio tuvo conocimiento del programa de intercambio en UTPL?', type: 'comunicacion' },
      { name: 'repetiria', label: '¿Postularía nuevamente para una estancia en la UTPL? ', type: 'select' },
    ];

    this.preguntas = this.proceso === 'outgoing' ? preguntasOutgoing : preguntasIncoming;

    this.preguntas.forEach(p => {
      this.encuestaForm.addControl(p.name, this.fb.control('', Validators.required));
    });

    this.actualizarPreguntasVisibles();
    this.cargarDatosUsuario();
  }

  actualizarPreguntasVisibles() {
    if (this.paginaActual === 0) {
      this.preguntasVisibles = [];
    } else {
      const inicio = (this.paginaActual - 1) * this.preguntasPorPagina;
      const fin = inicio + this.preguntasPorPagina;
      this.preguntasVisibles = this.preguntas.slice(inicio, fin);
    }
  }

  get totalPages() {
    const totalPaginasPreguntas = Math.ceil(this.preguntas.length / this.preguntasPorPagina);
    return totalPaginasPreguntas + 1;
  }

  paginaSiguiente() {
    if (this.paginaActual === 0 || this.validarPaginaActual()) {
      if (this.paginaActual < this.totalPages - 1) {
        this.paginaActual++;
        this.actualizarPreguntasVisibles();
      }
    } else {
      this.alertaService.mostrarAlerta(
        'error',
        'Debes responder todas las preguntas antes de continuar',
        'Por favor, complete todas las preguntas de la presente página.'
      );
    }
  }

  paginaAnterior() {
    if (this.paginaActual > 0) {
      this.paginaActual--;
      this.actualizarPreguntasVisibles();
    }
  }

  validarPaginaActual(): boolean {
    const controlesPagina = this.preguntasVisibles.map(p => this.encuestaForm.get(p.name));
    controlesPagina.forEach(c => c?.markAsTouched());
    return controlesPagina.every(control => control?.valid);
  }

  submitSurvey(): void {
    if (this.soloLectura) {
      alert('Solo lectura. No se puede enviar.');
      return;
    }

    if (!this.encuestaForm.valid) {
      this.alertaService.mostrarAlerta(
        'error',
        'Formulario incompleto.',
        'Por favor, responde todas las preguntas antes de enviar.'
      );
      this.encuestaForm.markAllAsTouched();
      return;
    }

    const surveyData = { ...this.encuestaForm.value };
    this.userDataService.saveSurvey(this.data.email, surveyData).subscribe({
      next: () => {
        this.showAlerta = true;
        setTimeout(() => this.dialogRef.close(), 2500);
      },
      error: err =>
        this.alertaService.mostrarAlerta(
          'error',
          'Error al guardar la encuesta.',
          'No se logró guardar la encuesta, por favor intentelo de nuevo.'
        )
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
      if (!userData) return;

      this.userDataService.getUniversityData(this.data.email).subscribe(universityData => {
        if (!universityData) return;

        this.encuestaForm.patchValue({
          nombres: `${userData.firstName} ${userData.lastName}` || `${userData.nombres} ${userData.apellidos}`,
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
