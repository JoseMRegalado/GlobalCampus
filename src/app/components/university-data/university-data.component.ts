
import { Component } from '@angular/core';
import { AuthService } from '../../services/login.service'; // Servicio de autenticación
import { UserDataService } from '../../services/user-data.service';
import {ActivatedRoute} from "@angular/router";
import {switchMap} from "rxjs"; // Servicio para manejar los datos del usuario

@Component({
  selector: 'app-university-data',
  templateUrl: './university-data.component.html',
  styleUrls: ['./university-data.component.css']
})
export class UniversityDataComponent {
  userEmail: string | null = null;
  hasData: boolean = false;


  formData = {
    universityName: '',
    universityCountry: '',
    universityAddress: '',
    universityPhone: '',
    universityWeb: '',
    faculty: '',
    studentType: '',
    program: '',
    period: '',
    spanishLevel: '',
    mobilityModality: '',
    mobilityType: '',
  };

  // Opciones predefinidas para los campos
  countries = [
    'Argentina', 'Brasil', 'Canadá', 'Chile', 'Colombia', 'Ecuador', 'Costa Rica',
    'Cuba', 'España', 'Francia', 'Guatemala', 'Italia', 'Estados Unidos',
    'México', 'Perú', 'Venezuela', 'Bolivia', 'República Dominicana', 'Otro'
  ];

  modalities = ['Presencial', 'Abierta y a Distancia'];
  periods = ['Abril-Agosto 2025', 'Octubre 2025-Febrero 2026', 'Abril-Agosto 2026'];
  spanishLevels = ['Nativo', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  mobilityModalities = ['Presencial', 'Virtual'];
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

  isAdmin: boolean = false;
  isEditable: boolean = true; // Para controlar si el formulario es editable

  constructor(
    private authService: AuthService,
    private userDataService: UserDataService,
  private route: ActivatedRoute

) {
  }

  ngOnInit() {
    this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (user) {
          this.userEmail = user.email;
          console.log("🟢 Usuario autenticado:", this.userEmail);
          // @ts-ignore
          return this.userDataService.getUserRole(this.userEmail);
        }
        throw new Error("❌ No hay usuario autenticado");
      }),
      switchMap(role => {
        this.isAdmin = role === 'admin';
        this.isEditable = !this.isAdmin;
        console.log("👑 Rol del usuario:", role);
        return this.route.queryParams; // Esperamos los queryParams
      })
    ).subscribe(params => {
      const emailFromParams = params['userEmail'];
      console.log("🔍 Email en queryParams:", emailFromParams);

      if (this.isAdmin && emailFromParams) {
        this.userEmail = emailFromParams; // Sobreescribimos si es admin
        console.log("✅ Admin viendo datos de otro usuario:", this.userEmail);
      } else {
        console.log("🛑 No es admin o no hay email en queryParams, usando:", this.userEmail);
      }

      if (this.userEmail) {
        console.log("📡 Cargando datos para:", this.userEmail);
        this.loadUserData(this.userEmail);
      }
    });
  }


  loadUserData(email: string) {
    this.userDataService.getUniversityData(email).subscribe(data => {
      if (data) {
        this.formData = data;
        this.hasData = true;
      }
    });
  }

  saveForm() {
    if (this.userEmail && !this.isAdmin) {
      const userData = { ...this.formData, email: this.userEmail };

      if (this.hasData) {
        this.userDataService.updateUniversityData(this.userEmail, userData).subscribe({
          error: (err) => alert('Error al actualizar los datos: ' + err),
        });
      } else {
        this.userDataService.saveUniversityData(userData).subscribe({
          error: (err) => alert('Error al guardar los datos: ' + err),
        });
      }
    }
  }

  onFacultyOrStudentTypeChange(selectedFaculty: string, selectedType: string) {
    this.selectedPrograms = this.programsByFaculty[selectedFaculty]?.filter(
      (program: any) => program.type === selectedType
    ) || [];
  }
}
