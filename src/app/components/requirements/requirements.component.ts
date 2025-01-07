import { Component } from '@angular/core';
interface Option {
  name: string;
  icon: string; // URL o clase de icono
  requirements: string[];
  steps: string[];
}
@Component({
  selector: 'app-requirements',
  templateUrl: './requirements.component.html',
  styleUrls: ['./requirements.component.css']
})
export class RequirementsComponent {
  options: Option[] = [
    {
      name: 'Intercambio estudiantil',
      icon: 'assets/icons/plane.png',
      requirements: [
        'Estudiante regular de la Universidad de Origen',
        'Certificado de notas de todos los ciclos cursados',
        'Carta de postulación de la Universidad de Origen',
      ],
      steps: [
        'Paso 1: Elección de asignaturas...',
        'Paso 2: Revisar nuestra malla curricular...',
        'Paso 3: Enviar la documentación...',
      ],
    },
    {
      name: 'Prácticas/Pasantías',
      icon: 'assets/icons/image37.png',
      requirements: [
        'Carta de aceptación de la empresa',
        'Informe de actividades a realizar',
        'Copia de seguro médico internacional',
      ],
      steps: [
        'Paso 1: Solicitar aceptación en la empresa...',
        'Paso 2: Revisar los requisitos académicos...',
        'Paso 3: Presentar informe final...',
      ],
    },
    {
      name: 'Estancias de Investigación',
      icon: 'assets/icons/image41.png',
      requirements: [
        'Carta de aceptación de la empresa',
        'Informe de actividades a realizar',
        'Copia de seguro médico internacional',
      ],
      steps: [
        'Paso 1: Solicitar aceptación en la empresa...',
        'Paso 2: Revisar los requisitos académicos...',
        'Paso 3: Presentar informe final...',
      ],
    },
    {
      name: 'Cursos cortos',
      icon: 'assets/icons/image40.png',
      requirements: [
        'Carta de aceptación de la empresa',
        'Informe de actividades a realizar',
        'Copia de seguro médico internacional',
      ],
      steps: [
        'Paso 1: Solicitar aceptación en la empresa...',
        'Paso 2: Revisar los requisitos académicos...',
        'Paso 3: Presentar informe final...',
      ],
    },
    {
      name: 'Visita Académica',
      icon: 'assets/icons/image.png',
      requirements: [
        'Carta de aceptación de la empresa',
        'Informe de actividades a realizar',
        'Copia de seguro médico internacional',
      ],
      steps: [
        'Paso 1: Solicitar aceptación en la empresa...',
        'Paso 2: Revisar los requisitos académicos...',
        'Paso 3: Presentar informe final...',
      ],
    },
    {
      name: 'Voluntariado',
      icon: 'assets/icons/image38.png',
      requirements: [
        'Carta de aceptación de la empresa',
        'Informe de actividades a realizar',
        'Copia de seguro médico internacional',
      ],
      steps: [
        'Paso 1: Solicitar aceptación en la empresa...',
        'Paso 2: Revisar los requisitos académicos...',
        'Paso 3: Presentar informe final...',
      ],
    },
    {
      name: 'Representación Institucional',
      icon: 'assets/icons/image39.png',
      requirements: [
        'Carta de aceptación de la empresa',
        'Informe de actividades a realizar',
        'Copia de seguro médico internacional',
      ],
      steps: [
        'Paso 1: Solicitar aceptación en la empresa...',
        'Paso 2: Revisar los requisitos académicos...',
        'Paso 3: Presentar informe final...',
      ],
    },
  ];

  selectedOption: Option | null = null;

  // Método para seleccionar una opción
  selectOption(option: Option) {
    this.selectedOption = option;
  }
}
