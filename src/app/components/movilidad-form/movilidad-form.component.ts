import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/login.service';
import { UserDataService } from '../../services/user-data.service';

@Component({
  selector: 'app-movilidad-form',
  templateUrl: './movilidad-form.component.html',
  styleUrls: ['./movilidad-form.component.css']
})
export class MovilidadFormComponent implements OnInit {
  userEmail: string | null = null;
  userRole: string | null = null;
  isAdmin: boolean = false;
  selectedUserEmail: string | null = null;  // Email del usuario de los queryParams (si es admin)

  formData = {
    nombres: '',
    apellidos: '',
    lugarNacimiento: '',
    fechaNacimiento: '',
    cedula: '',
    direccion:'',
    celular: '',
    tipoEstudiante:'',
    facultad: '',
    carrera: '',
    semestre: '',
    promedio: '',
    periodoMovilidad: '',
    tipoMovilidad: '',
    contactoEmergencia: '',
    universidadDestino: '',
    titulacionDestino: '',
    periodoDestino: '',
    paisDestino: '',
    declaracion: false
  };

  periods = ['Abril-Agosto 2025', 'Octubre 2025-Febrero 2026', 'Abril-Agosto 2026'];

  mobilityTypes = [
    'Intercambio', 'Prácticas y Pasantías', 'Programas Cortos',
    'Voluntarios', 'Representación Institucional', 'Estancias de investigación'
  ];



  faculties = [
    'Ciencias de la Salud', 'Ciencias Económicas y Empresariales',
    'Ciencias Exactas y Naturales', 'Ciencias Sociales, Educación y Humanidades',
    'Ciencias Jurídicas y Políticas', 'Ingenierías y Arquitectura',
    'Unidad Académica Escuela de Desarrollo Empresarial - EDES'
  ];

  // Carreras agrupadas por facultad y tipo de estudiante
  programsByFaculty: any = {
    'Ciencias de la Salud': [
      { name: 'Enfermería', type: 'Grado' },
      { name: 'Fisioterapia', type: 'Grado' },
      { name: 'Medicina', type: 'Grado' },
      { name: 'Nutrición y Dietética', type: 'Grado' },
      { name: 'Maestría en Análisis Biológico y Diagnóstico de Laboratorio', type: 'Posgrado' },
      { name: 'Especialidad en Medicina Familiar y Comunitaria', type: 'Posgrado' },
      { name: 'Maestría en Gerencia de Instituciones de Salud', type: 'Posgrado' },
      { name: 'Maestría en Gestión de la Calidad y Auditoria en Salud', type: 'Posgrado' }
    ],
    'Ciencias Económicas y Empresariales': [
      { name: 'Administración de Empresas', type: 'Grado' },
      { name: 'Administración Pública', type: 'Grado' },
      { name: 'Contabilidad y Auditoría', type: 'Grado' },
      { name: 'Economía', type: 'Grado' },
      { name: 'Finanzas', type: 'Grado' },
      { name: 'Gastronomía', type: 'Grado' },
      { name: 'Turismo', type: 'Grado' },
      { name: 'Maestría en Finanzas', type: 'Posgrado' },
      { name: 'Maestría en Gestión de Proyectos', type: 'Posgrado' },
      { name: 'Maestría en Cooperación Internacional para el Desarrollo Sostenible', type: 'Posgrado' },
      { name: 'Maestría en Auditoría con mención en Gestión del Riesgo de Fraude Financiero y Auditoría Forense', type: 'Posgrado' },
      { name: 'Maestría en Gestión e Innovación de Alimentos y Bebidas', type: 'Posgrado' }
    ],
    'Ciencias Exactas y Naturales': [
      { name: 'Agronegocios', type: 'Grado' },
      { name: 'Agropecuaria', type: 'Grado' },
      { name: 'Alimentos', type: 'Grado' },
      { name: 'Biología', type: 'Grado' },
      { name: 'Bioquímica y Farmacia', type: 'Grado' },
      { name: 'Gestión Ambiental', type: 'Grado' },
      { name: 'Gestión de Riesgos y Desastres', type: 'Grado' },
      { name: 'Ingeniería Ambiental', type: 'Grado' },
      { name: 'Ingeniería Industrial', type: 'Grado' },
      { name: 'Ingeniería Química', type: 'Grado' },
      { name: 'Seguridad y Salud Ocupacional', type: 'Grado' },
      { name: 'Maestría en Ciencias Químicas', type: 'Posgrado' },
      { name: 'Maestría en Seguridad Industrial, con mención en Prevención de Riesgos Laborales', type: 'Posgrado' }
    ],
    'Ciencias Sociales, Educación y Humanidades': [
      { name: 'Artes Escénicas', type: 'Grado' },
      { name: 'Artes Visuales', type: 'Grado' },
      { name: 'Comunicación', type: 'Grado' },
      { name: 'Educación Básica', type: 'Grado' },
      { name: 'Educación Inicial', type: 'Grado' },
      { name: 'Pedagogía de la Lengua y la Literatura', type: 'Grado' },
      { name: 'Pedagogía de las Ciencias Experimentales (Pedagogía de la Química y Biología)', type: 'Grado' },
      { name: 'Pedagogía de las Ciencias Experimentales (Pedagogía de las Matemáticas y la Física)', type: 'Grado' },
      { name: 'Pedagogía de los Idiomas Nacionales y Extranjeros', type: 'Grado' },
      { name: 'Pedagogía en Ciencias Sociales y Humanidades', type: 'Grado' },
      { name: 'Psicología', type: 'Grado' },
      { name: 'Psicología Clínica', type: 'Grado' },
      { name: 'Psicopedagogía', type: 'Grado' },
      { name: 'Maestría en Pedagogía de los idiomas nacionales y extranjeros, mención enseñanza del inglés', type: 'Posgrado' },
      { name: 'Maestría en Comunicación Estratégica, mención Comunicación Digital', type: 'Posgrado' },
      { name: 'Maestría en Educación, mención Gestión del aprendizaje mediado por TIC', type: 'Posgrado' }
    ],
    'Ciencias Jurídicas y Políticas': [
      { name: 'Derecho', type: 'Grado' },
      { name: 'Maestría en Derecho Constitucional', type: 'Posgrado' },
      { name: 'Maestría en Derecho, mención Derecho Procesal', type: 'Posgrado' },
      { name: 'Maestría en Derecho Penal, mención Derecho Procesal Penal', type: 'Posgrado' },
      { name: 'Maestría en Ciencias Políticas, mención en Políticas Públicas', type: 'Posgrado' }
    ],
    'Ingenierías y Arquitectura': [
      { name: 'Arquitectura', type: 'Grado' },
      { name: 'Computación', type: 'Grado' },
      { name: 'Geología', type: 'Grado' },
      { name: 'Ingeniería Civil', type: 'Grado' },
      { name: 'Logística y Transporte', type: 'Grado' },
      { name: 'Telecomunicaciones', type: 'Grado' },
      { name: 'Tecnologías de la Información', type: 'Grado' },
      { name: 'Maestría en Planificación del Territorio', type: 'Posgrado' },
      { name: 'Maestría en Gestión Integrada de Recursos Hídricos', type: 'Posgrado' },
      { name: 'Maestría en Inteligencia Artificial Aplicada', type: 'Posgrado' }
    ],
    'Unidad Académica Escuela de Desarrollo Empresarial - EDES': [
      { name: 'Maestría en Administración de Empresas, mención Innovación', type: 'Posgrado' },
      { name: 'Maestría en Gestión del Talento Humano Management 3.0', type: 'Posgrado' },
      { name: 'Maestría en Dirección Financiera, mención Fintech', type: 'Posgrado' },
      { name: 'Maestría en Marketing con mención en Transformación Digital', type: 'Posgrado' }
    ]
  };

  selectedPrograms: any[] = [];
  isEditable: boolean = true; // Para controlar si el formulario es editable

  hasData: boolean = false;

  constructor(
    private authService: AuthService,
    private userDataService: UserDataService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.userEmail = user?.email || null;
      this.route.queryParams.subscribe(params => {
        this.selectedUserEmail = params['userEmail'] || null;

        if (this.userEmail) {
          this.loadUserRole();
        }
      });
    });
  }

  loadUserRole(): void {
    if (this.userEmail) {
      this.userDataService.getUserRole(this.userEmail).subscribe({
        next: (role: string | null) => {
          this.userRole = role ?? 'user';
          this.isAdmin = this.userRole === 'admin';
          this.loadUserData();
        },
        error: (err: any) => console.error('Error al obtener el rol:', err)
      });
    }
  }

  loadUserData(): void {
    let emailToLoad = this.isAdmin && this.selectedUserEmail ? this.selectedUserEmail : this.userEmail;

    if (emailToLoad) {
      this.userDataService.getUserData(emailToLoad).subscribe({
        next: (data: any) => {
          if (data) {
            this.formData = { ...data };
            this.hasData = true;
          } else {
            this.hasData = false;
          }
        },
        error: (err: any) => console.error('Error al cargar datos:', err)
      });
    }
  }

  saveOrUpdateForm(): void {
    if (this.isAdmin) {
      // Si es admin, no debe guardar los datos. Solo se pueden ver
      return;
    }

    let emailToSave: string = (this.isAdmin && this.selectedUserEmail ? this.selectedUserEmail : this.userEmail) as string;

    if (!emailToSave) {
      console.error('Error: No se puede guardar porque el email es null.');
      return;
    }

    const userData = {
      ...this.formData,
      email: emailToSave,
      proceso: 'outgoing',
    };

    if (this.hasData) {
      // Si el usuario no es admin, guardar los datos
      this.userDataService.updateUserData(emailToSave, userData).subscribe({
        next: () => this.updateUserProcess(emailToSave),
        error: (err: any) => alert('Error al actualizar los datos: ' + err.message)
      });
    } else {
      // Si el usuario no es admin y no hay datos, guardarlos
      this.userDataService.saveUserData(userData).subscribe({
        next: () => this.updateUserProcess(emailToSave),
        error: (err: any) => alert('Error al guardar los datos: ' + err.message)
      });
    }
  }

  onFacultyOrStudentTypeChange(selectedFaculty: string, selectedType: string) {
    this.selectedPrograms = this.programsByFaculty[selectedFaculty]?.filter(
      (program: any) => program.type === selectedType
    ) || [];
  }

  updateUserProcess(email: string): void {
    if (!email) {
      console.error('Error: No se puede actualizar el proceso porque el email es null.');
      return;
    }

    // Verificar si el documento existe antes de intentar actualizar
    this.userDataService.getUserData(email).subscribe({
      next: (data: any) => {
        if (data) {
          // Si el documento existe, se actualiza
          this.userDataService.updateUserProcess(email, 'outgoing').subscribe({
            error: (err: any) => console.error('Error al actualizar el proceso del usuario:', err)
          });
        } else {
          // Si el documento no existe, crearlo o manejar el error
          console.error('Error: El documento del usuario no existe.');
          // Opcionalmente puedes crear un documento nuevo si lo deseas:
          this.userDataService.saveUserData({ email, proceso: 'outgoing' }).subscribe({
            next: () => console.log('Documento creado con éxito.'),
            error: (err: any) => console.error('Error al crear el documento del usuario:', err)
          });
        }
      },
      error: (err: any) => console.error('Error al verificar la existencia del documento:', err)
    });

  }
}
