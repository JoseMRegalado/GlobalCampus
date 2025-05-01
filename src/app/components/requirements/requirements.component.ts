import { Component } from '@angular/core';
import {of, Subscription, switchMap, take} from "rxjs";
import {Router} from "@angular/router";
import {AuthService} from "../../services/login.service";
import {UserDataService} from "../../services/user-data.service";
import {AlertaService} from "../../services/alert.service";
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
  selector: 'app-requirements',
  templateUrl: './requirements.component.html',
  styleUrls: ['./requirements.component.css']
})

export class RequirementsComponent {

  constructor(
    private router: Router,
    private authService: AuthService,
    private userDataService: UserDataService,
    private alertaService: AlertaService,
  ) {}

  options: Option[] = [
    {
      name: 'Intercambio estudiantil',
      icon: 'assets/icons/intercambio.png',
      requirements: [
        'Estudiante regular de la Universidad de Origen',
        'Certificado de notas de todos los ciclos cursados',
        'Carta de postulación de la Universidad de Origen',
        'Copia a colores de pasaporte',
        'Foto tamaño pasaporte',
        'Seguro médico internacional que incluya servicio de repatriación'
      ],
      steps: [
        { title: 'Elección de asignaturas', description: 'Revisa nuestra malla curricular de la titulación que desees cursar en la UTPL por un semestre.' },
        { title: 'Aprobación de la universidad de origen', description: 'Consulta con el responsable de intercambios en tu universidad para iniciar tu nominación en la UTPL.' },
        { title: 'Postulación', description: 'Inicia tu proceso de postulación dentro de la plaforma.' },
        { title: 'Carta de aceptación', description: 'La UTPL enviará la carta de aceptación para que puedas iniciar tu trámite de visado (en caso de requerirlo).' },
        { title: 'Trámites de alojamiento', description: 'Contacta con nuestra oficina de movilidad para recibir asesoramiento sobre alojamiento, movilización y más.' },
        { title: 'Día de llegada', description: 'Al llegar a la UTPL, debes acercarte a la oficina de movilidad para recibir orientación académica.' },
        { title: 'Trámites de matriculación', description: 'La UTPL se encargará de la matrícula y la entrega de usuario y contraseña para acceder a la plataforma.' },
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

  private processSubscription: Subscription | null = null;
  isChecking: boolean = false;

  // Método para seleccionar una opción
  selectOption(option: Option) {
    this.selectedOption = option;
  }

  // Método que se llamará al hacer clic en el botón
  startOrContinueProcess() {
    if (!this.selectedOption || this.isChecking) {
      return; // No hacer nada si no hay opción seleccionada o ya está verificando
    }

    this.isChecking = true; // Bloquear el botón

    // Usamos take(1) porque solo necesitamos el estado actual del usuario una vez
    this.processSubscription = this.authService.getCurrentUser().pipe(
      take(1), // Obtener el primer valor emitido (el usuario actual o null) y cancelar
      switchMap(user => {
        if (user && user.email) {
          // Si hay usuario logueado, verifica si tiene personal-data
          return this.userDataService.getUserData(user.email);
        } else {
          // Si no hay usuario, tratamos como si no tuviera datos (irá a /personal-data, donde probablemente se le pida login)
          console.warn('Usuario no logueado al intentar iniciar proceso.');
          return of(null); // Devuelve un observable que emite null
        }
      })
    ).subscribe({
      next: (personalData) => {
        if (personalData) {
          // --- Tiene datos personales ---
          // Opcional: Guardar el tipo de movilidad seleccionado antes de navegar
          // this.saveMobilityType(user.email, this.selectedOption.name); // Necesitarías el email aquí
          console.log('Usuario tiene datos personales. Navegando a /process-status');
          this.router.navigate(['/process-status']);
        } else {
          // --- No tiene datos personales ---
          // Opcional: Guardar el tipo de movilidad seleccionado antes de navegar
          // this.saveMobilityType(user.email, this.selectedOption.name); // Necesitarías el email aquí
          console.log('Usuario NO tiene datos personales. Navegando a /personal-data');
          this.router.navigate(['/personal-data']);
        }
        this.isChecking = false; // Desbloquear el botón
      },
      error: (err) => {
        console.error('Error al verificar datos personales:', err);
        this.alertaService.mostrarAlerta(
          'error',
          'Información no verificada.',
          'Hubo un error al verificar tu información. Inténtalo de nuevo.'
        );
        // Considera navegar a una página de error o a /personal-data por defecto
        // this.router.navigate(['/personal-data']);
        this.isChecking = false; // Desbloquear el botón en caso de error
      }
    });
  }

  // --- Opcional: Método para guardar el tipo de movilidad ---
  // saveMobilityType(email: string, mobilityType: string) {
  //   this.userDataService.updateUserProcess(email, mobilityType).subscribe({ // Asumiendo que updateUserProcess sirve para esto
  //      next: () => console.log('Tipo de movilidad guardado:', mobilityType),
  //      error: (err) => console.error('Error guardando tipo de movilidad:', err)
  //   });
  // }


  ngOnDestroy(): void {
    // Cancelar la suscripción si el componente se destruye mientras verifica
    this.processSubscription?.unsubscribe();
  }
}
