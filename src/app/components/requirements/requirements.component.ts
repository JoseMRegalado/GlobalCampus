import { Component } from '@angular/core';
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
        { title: 'Elección de asignaturas', description: 'Revisa nuestra malla curricular de la titulación que desees cursar en la UTPL por un semestre o máximo un año.' },
        { title: 'Aprobación de la universidad de origen', description: 'Consulta con el responsable de intercambios en tu universidad para iniciar tu postulación en la UTPL.' },
        { title: 'Postulación', description: 'El responsable de intercambios en tu universidad deberá enviar tu postulación vía email con la documentación requerida.' },
        { title: 'Carta de aceptación', description: 'La UTPL enviará la carta de aceptación para que puedas iniciar tu trámite de visado.' },
        { title: 'Trámites de alojamiento', description: 'Contacta con nuestra oficina de movilidad para recibir asesoramiento sobre alojamiento, movilización y más.' },
        { title: 'Día de llegada', description: 'Al llegar a la UTPL, debes acercarte a la oficina de movilidad para recibir orientación académica.' },
        { title: 'Trámites de matriculación', description: 'La UTPL se encargará de la matrícula y la entrega de usuario y contraseña para acceder a la plataforma.' },
      ],
    },
    {
      name: 'Prácticas Pasantías',
      icon: 'assets/icons/image37.png',
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
      icon: 'assets/icons/image39.png',
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
}
