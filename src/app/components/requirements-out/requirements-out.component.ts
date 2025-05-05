import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/login.service';
import { UserDataService } from '../../services/user-data.service';
import { AlertaService } from '../../services/alert.service';
import { Subscription, of, switchMap, take } from 'rxjs';

interface Step {
  title?: string; // Opcional
  description: string;
}

interface Option {
  name: string;
  icon: string;
  requirements: string[];
  steps: Step[];
}

@Component({
  selector: 'app-requirements-out',
  templateUrl: './requirements-out.component.html',
  styleUrls: ['./requirements-out.component.css']
})

export class RequirementsOutComponent implements OnDestroy {
  constructor(
    private router: Router,
    private authService: AuthService,
    private userDataService: UserDataService,
    private alertaService: AlertaService
  ) {}

  options: Option[] = [
    {
      name: 'Intercambio estudiantil',
      icon: 'assets/icons/intercambio.png',
      requirements: [
        'Copia a colores de documento de identidad/pasaporte.',
        'Promedio mínimo general para la postulación es de 8.5 .',
        'Se podrá postular desde el 3er ciclo hasta el penúltimo ciclo.',
        'Seguro médico internacional que incluya servicio de repatriación.'
      ],
      steps: [
        { title: 'Elección de universidad', description: 'Revisa en nuestro catálogo las universidades extranjeras con convenio con la univerisidad, y elige a la que quieres ir' },
        { title: 'Elección de asignaturas', description: 'Revisa la malla curricular de tu carrera y compararla con la malla de la universidad extranjera seleccionada.' },
        { title: 'Validación', description: 'Validar las asignaturas seleccionadas con tu director de carrera de UTPL' },
        { title: 'Postulación', description: 'Dentro de la plataforma de Global-Campus llenar el formulario de datos personales y documentos requeridos.' },
        { title: 'Nominación del estudiante', description: 'Desde la oficina de Movilidad, se nominará al estudiante a la universidad extranjera, la misma que una vez aceptada la nominación se contactara directamente con el estudiante.' },
        { title: 'Carta de aceptación', description: 'Dentro de la plataforma de Global-Campus, se subirá la carta de aceptación por la universidad extranjera.' },
        { title: 'Visa y seguro internacional', description: 'El estudiante hará su proceso de visado y contratara un seguro internacional.' },
        { title: 'Subir documentación', description: 'Dentro de la plataforma de Global-Campus, subir formato de carta institucional, visa, carta de compromiso, autorización de comunicación de datos personales y seguro internacional.' },
        { title: 'Compra de pasajes aéreos', description: 'Una vez aceptada la visa, el estudiante compra los pasajes aéreos, para que UTPL les realice el reembolso correspondiente.' },
        { title: 'Reembolso', description: 'Se necesitarán pasaje e intinerario de vuelo, cuenta bancaria y la factura para realizar el reembolso, mismos documentos que serán subidos a la plataforma.' },
        { title: 'Homologación', description: 'Al terminar tu ciclo académico, debes acercarte a la oficina de Movilidad para la homologación de materias.' },
      ],
    },
    {
      name: 'Prácticas Pasantías',
      icon: 'assets/icons/pasantias.png',
      requirements: [
        'Pasaporte o documento de identidad del país de origen (a color).',
        'Carta de postulación de la Universidad de extranjera',
        'Informe de actividades a realizar',
        'Copia de seguro médico internacional',
      ],
      steps: [
        {description:'Paso 1: Solicitar aceptación en la empresa...'},
        {description: 'Paso 2: Revisar los requisitos académicos...'},
        {description: 'Paso 3: Presentar informe final...'},
      ],
    },
    {
      name: 'Estancias de Investigación',
      icon: 'assets/icons/investigacion.png',
      requirements: [
        'Carta de aceptación de la empresa',
        'Informe de actividades a realizar',
        'Copia de seguro médico internacional',
      ],
      steps: [
        {description:'Paso 1: Solicitar aceptación en la empresa...'},
        {description: 'Paso 2: Revisar los requisitos académicos...'},
        {description: 'Paso 3: Presentar informe final...'},
      ],
    },
    {
      name: 'Cursos cortos',
      icon: 'assets/icons/cursos.png',
      requirements: [
        'Carta de aceptación de la empresa',
        'Informe de actividades a realizar',
        'Copia de seguro médico internacional',
      ],
      steps: [
        {description:'Paso 1: Solicitar aceptación en la empresa...'},
        {description: 'Paso 2: Revisar los requisitos académicos...'},
        {description: 'Paso 3: Presentar informe final...'},
      ],
    },
    {
      name: 'Visita Académica',
      icon: 'assets/icons/visita_academica.png',
      requirements: [
        'Carta de aceptación de la empresa',
        'Informe de actividades a realizar',
        'Copia de seguro médico internacional',
      ],
      steps: [
        {description:'Paso 1: Solicitar aceptación en la empresa...'},
        {description: 'Paso 2: Revisar los requisitos académicos...'},
        {description: 'Paso 3: Presentar informe final...'},
      ],
    },
    {
      name: 'Voluntariado',
      icon: 'assets/icons/voluntariado.png',
      requirements: [
        'Carta de aceptación de la empresa',
        'Informe de actividades a realizar',
        'Copia de seguro médico internacional',
      ],
      steps: [
        {description:'Paso 1: Solicitar aceptación en la empresa...'},
        {description: 'Paso 2: Revisar los requisitos académicos...'},
        {description: 'Paso 3: Presentar informe final...'},
      ],
    },
    {
      name: 'Representación Institucional',
      icon: 'assets/icons/representacion.png',
      requirements: [
        'Carta de aceptación de la empresa',
        'Informe de actividades a realizar',
        'Copia de seguro médico internacional',
      ],
      steps: [
        {description:'Paso 1: Solicitar aceptación en la empresa...'},
        {description: 'Paso 2: Revisar los requisitos académicos...'},
        {description: 'Paso 3: Presentar informe final...'},
      ],
    },
  ];

  selectedOption: Option | null = null;

  // Método para seleccionar una opción
  selectOption(option: Option) {
    this.selectedOption = option;
  }

  isChecking: boolean = false;
  private processSubscription: Subscription | null = null;

  startOrContinueProcess() {
    if (!this.selectedOption || this.isChecking) return;

    this.isChecking = true;

    this.processSubscription = this.authService.getCurrentUser().pipe(
      take(1),
      switchMap(user => {
        if (user && user.email) {
          return this.userDataService.getUserData(user.email);
        } else {
          console.warn('Usuario no logueado al intentar iniciar proceso.');
          return of(null);
        }
      })
    ).subscribe({
      next: (personalData) => {
        if (personalData) {
          this.router.navigate(['/process-status']);
        } else {
          this.router.navigate(['/out']);
        }
        this.isChecking = false;
      },
      error: (err) => {
        console.error('Error al verificar datos personales:', err);
        this.alertaService.mostrarAlerta(
          'error',
          'Información no verificada.',
          'Hubo un error al verificar tu información. Inténtalo de nuevo.'
        );
        this.isChecking = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.processSubscription?.unsubscribe();
  }

}
