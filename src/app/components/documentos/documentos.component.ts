import { Component, OnInit } from '@angular/core';
import { UserDataService } from '../../services/user-data.service';
import { AuthService } from '../../services/login.service';
import { Observable } from 'rxjs';
import {ActivatedRoute} from "@angular/router";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-documentos',
  templateUrl: './documentos.component.html',
  styleUrls: ['./documentos.component.css']
})
export class DocumentosComponent implements OnInit {
  email: string = '';
  role: string | null = '';
  documentos: any[] = [];
  descripcion: string = '';
  archivoBase64: string = '';
  fechaActual: string ='';
  selectedFile: File | null = null;
  usuarios: any[] = [];  // Almacena todos los usuarios
  usuarioSeleccionado: string = ''; // Almacena el usuario seleccionado
  documentosNombres: string[] = [];
  userEmail: string = ''; // Email obtenido de los queryParams

  documentosAprobados: number = 0;
  selectedCartaFile: File | null = null;
  cartaBase64: string = '';
  cartaEstado: string = '';
  cartaSubida: string | null = null;

  oficioGenerado: boolean = false;
  cartaCompromisoSubida: boolean = false;

  cartaCompromisoUrl: string = ''; // Nueva variable para almacenar la URL

  constructor(private userDataService: UserDataService, private authService: AuthService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user?.email) {
        this.email = user.email;

        this.userDataService.getUserRole(this.email).subscribe(role => {
          this.role = role;

          if (this.role === 'admin') {
            this.route.queryParams.subscribe(params => {
              this.userEmail = params['userEmail'];
              this.obtenerDocumentos();
            });
          } else {
            this.obtenerDocumentos();
          }
        });
      }
    });
  }

  obtenerDocumentos() {
    const emailConsulta = this.role === 'admin' ? this.userEmail : this.email;
    if (!emailConsulta) return;

    this.userDataService.getDocuments(emailConsulta).subscribe(docs => {
      this.documentos = docs;
      this.documentosAprobados = this.documentos.filter(doc => doc.estado === 'aprobado').length;

      this.userDataService.getOficio(emailConsulta).subscribe(oficio => {
        this.oficioGenerado = !!oficio;
      });

      this.userDataService.getCartaCompromiso(emailConsulta).subscribe(carta => {
        if (carta?.archivo) {
          this.cartaCompromisoSubida = true;
          this.cartaCompromisoUrl = carta.archivo; // Guardamos la URL del documento
        }
      });
    });
  }


generarOficio() {
  if (!this.userEmail) {
    alert('No se encontró el correo del usuario.');
    return;
  }

  this.userDataService.getUserData(this.userEmail).subscribe(userData => {
    if (!userData) {
      alert('No se encontraron datos personales del usuario.');
      return;
    }

    this.userDataService.getUniversityData(this.userEmail).subscribe(async universityData => {
      if (!universityData) {
        alert('No se encontraron datos universitarios del usuario.');
        return;
      }

      const pdf = new jsPDF();
      const fechaActual = this.formatFecha();

      // **Renderizar Logo en formato PNG**
      const logo = new Image();
      logo.src = 'assets/img/logo.png'; // Cambiado a PNG
      logo.onload = () => {
        // **Agregar Logo PNG en el encabezado**
        pdf.addImage(logo, 'PNG', 150, 10, 40, 30); // Ajusta el tamaño según sea necesario

        // **Encabezado**
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(12);
        pdf.text(fechaActual, 20, 40);
        pdf.text('DGRI-GLOBAL-XXX-2024', 20, 45);

        pdf.text('Dr.', 20, 55);
        pdf.text('Daniel Guamán Coronel', 20, 60);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Director de la Carrera de Tecnologías de la Información', 20, 65);

        // **Cuerpo del Oficio con datos dinámicos**
        const textoOficio = `Por medio del presente comunico a usted la postulación presentada por el/la estudiante ${userData.firstName} ${userData.lastName}, con identificación N. ${userData.idNumber} de la ${universityData.universityName}, quien desea realizar su Programa de ${universityData.mobilityType} ${universityData.mobilityModality} en nuestra Universidad en la Modalidad Abierta y a Distancia, en el período ${universityData.period}.`;

        pdf.setFont('helvetica', 'normal');
        pdf.text(textoOficio, 20, 80, { maxWidth: 170 });

        // **Materia a validar**
        const materia = universityData.materia || 'Desarrollo basado en Plataformas Móviles';
        pdf.text(
          `El/la estudiante en su contrato de estudios ha seleccionado la siguiente materia, misma que debe ser validada por parte de la Titulación, para proceder con la matrícula y beca:`,
          20, 105, { maxWidth: 170 }
        );

        pdf.setFont('helvetica', 'bold');
        pdf.text(materia, 20, 120);

        pdf.setFont('helvetica', 'normal');
        pdf.text('Envío la documentación presentada, para que sea analizada y se pueda dar una respuesta y una aceptación formal.', 20, 130, { maxWidth: 170 });
        pdf.text('Por la atención a la presente, le anticipo mis más sinceros agradecimientos.', 20, 145, { maxWidth: 170 });
        pdf.text('Atentamente,', 20, 165);

        // **Firma debajo de "Atentamente"**
        const firma = new Image();
        firma.src = 'assets/img/firma.png'; // Ruta del archivo de la firma en PNG
        firma.onload = () => {
          pdf.addImage(firma, 'PNG', 20, 170, 40, 20); // Ajusta las coordenadas y tamaño según sea necesario

          // **Firma final**
          pdf.setFont('helvetica', 'bold');
          pdf.text('Silvia Cristina Luzuriaga Muñoz', 20, 200);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          pdf.text('Coordinadora de Internacionalización y Movilidad', 20, 205);
          pdf.text('Programa de Movilidad Estudiantil', 20, 209);
          pdf.text('Global Campus', 20, 213);
          pdf.text('Dirección Relaciones Interinstitucionales.', 20, 217);
          pdf.text('Ext. 2442', 20, 221);

          // **Guardar en Firebase**
          const pdfBlob = pdf.output('blob');
          const reader = new FileReader();
          reader.readAsDataURL(pdfBlob);
          reader.onloadend = () => {
            const base64Pdf = reader.result as string;
            this.userDataService.saveOficio(this.userEmail, base64Pdf).subscribe(() => {
              alert('Oficio generado y guardado en Firebase.');
              this.oficioGenerado = true;
            });
          };
        };
      };
    });
  });
}

// Función para formatear la fecha correctamente
formatFecha(): string {
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const fecha = new Date();
  const dia = fecha.getDate();
  const mes = meses[fecha.getMonth()];
  const año = fecha.getFullYear();
  return `Loja, ${dia} de ${mes} de ${año}`;
}


descargarOficio() {
    if (!this.userEmail) return;

    this.userDataService.getOficio(this.userEmail).subscribe(oficio => {
      if (oficio?.archivo) {
        const link = document.createElement('a');
        link.href = oficio.archivo;
        link.download = 'Oficio.pdf';
        link.click();
      } else {
        alert('No se encontró el Oficio.');
      }
    });
  }

  generarCartaCompromiso() {
    if (!this.userEmail) {
      alert('No se encontró el correo del usuario.');
      return;
    }

    const pdf = new jsPDF();
    pdf.setFontSize(12);
    pdf.text('Carta de Compromiso', 105, 20, { align: 'center' });
    pdf.text('Yo, [Nombre del estudiante], me comprometo a cumplir con los lineamientos del programa de movilidad estudiantil.', 20, 50);
    pdf.text('Entiendo que debo respetar las normas de la universidad de destino y regresar a mi institución de origen una vez finalizado el programa.', 20, 70);
    pdf.text('Atentamente,', 20, 110);
    pdf.text('_____________________', 20, 150);
    pdf.text('Firma del estudiante', 20, 160);

    const pdfBlob = pdf.output('blob');
    const reader = new FileReader();
    reader.readAsDataURL(pdfBlob);
    reader.onloadend = () => {
      const base64Pdf = reader.result as string;
      this.userDataService.saveCartaCompromiso(this.userEmail, base64Pdf).subscribe(() => {
        alert('Carta de Aceptación generada y guardada en Firebase.');
        this.cartaCompromisoSubida = true;
        this.userDataService.actualizarEstadoPostulacion(this.userEmail);
      });
    };
  }

  descargarCartaCompromiso() {
    if (!this.userEmail) return;

    this.userDataService.getCartaCompromiso(this.userEmail).subscribe(carta => {
      if (carta?.archivo) {
        const link = document.createElement('a');
        link.href = carta.archivo;
        link.download = 'Carta_Compromiso.pdf';
        link.click();
      } else {
        alert('No se encontró la Carta de Compromiso.');
      }
    });
  }


// Obtener todos los usuarios (Solo para admin)
  obtenerUsuarios() {
    this.userDataService.getAllUsers().subscribe(users => {
      this.usuarios = users;
    });
  }
  archivoCargado: boolean = false;

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] || null;

    if (this.selectedFile) { // Verificamos que no sea null
      this.archivoCargado = true;
      const reader = new FileReader();
      reader.onload = () => {
        this.archivoBase64 = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.archivoCargado = false;
    }
  }




  /**
   * Carga un nuevo documento o actualiza el documento en "pendiente".
   */
  cargarDocumento(doc?: any) {
    if (!this.email || !this.selectedFile) {
      alert('Debe seleccionar un archivo para subir.');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.selectedFile);
    reader.onload = () => {
      const base64File = reader.result as string;

      const nuevoDocumento = {
        email: this.email,
        descripcion: this.descripcion || doc?.descripcion,
        archivo: base64File,
        fechaIngreso: new Date().toISOString().split('T')[0],
        fechaValidacion: '',
        observaciones: '',
        estado: 'en revisión'
      };

      if (doc?.id) {
        // Actualizar el documento existente en estado "pendiente"
        this.userDataService.updateDocument(this.email, doc.id, nuevoDocumento).subscribe({
          next: () => {
            alert('Documento actualizado correctamente.');
            this.descripcion = '';
            this.selectedFile = null;
            this.obtenerDocumentos();
          },
          error: err => {
            alert('Error al actualizar el documento: ' + err);
          }
        });
      } else {
        // Crear un nuevo documento
        this.userDataService.saveDocument(this.email, nuevoDocumento).subscribe({
          next: () => {
            alert('Documento subido correctamente.');
            this.descripcion = '';
            this.selectedFile = null;
            this.obtenerDocumentos();
          },
          error: err => {
            alert('Error al subir el documento: ' + err);
          }
        });
      }
    };
  }

  validarDocumento(doc: any) {
    const data = { ...doc };

    if (doc.estado === 'aprobado') {
      data.fechaValidacion = new Date().toISOString().split('T')[0];
    }

    this.userDataService.updateDocument(doc.email, doc.id, data).subscribe({
      next: () => {
        console.log('Documento validado con éxito');
        this.obtenerDocumentos();
      },
      error: (error) => console.error('Error al validar el documento:', error)
    });
  }


  verDocumento(base64: string) {
    // Asegura que tenga el encabezado correcto
    if (!base64.startsWith('data:application/pdf;base64,')) {
      base64 = 'data:application/pdf;base64,' + base64;
    }

    // Decodifica el Base64 a binario
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);

    // Crea un Blob con el binario
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    // Genera una URL temporal para el Blob
    const blobUrl = URL.createObjectURL(blob);

    // Abre la URL en una nueva pestaña
    window.open(blobUrl, '_blank');
  }

  generarCartaAceptacion() {
    if (!this.userEmail) {
      alert('No se encontró el correo del usuario.');
      return;
    }

    this.userDataService.getUserData(this.userEmail).subscribe(userData => {
      if (!userData) {
        alert('No se encontraron datos personales del usuario.');
        return;
      }

      this.userDataService.getUniversityData(this.userEmail).subscribe(universityData => {
        if (!universityData) {
          alert('No se encontraron datos universitarios del usuario.');
          return;
        }

        const pdf = new jsPDF();
        const fechaActual = new Date().toLocaleDateString('es-ES');

        // Encabezado
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Carta de Compromiso y Autorización', 105, 20, { align: 'center' });

// Datos del estudiante
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('DATOS DEL ESTUDIANTE', 15, 30);

        pdf.text('Identificación: ', 15, 40);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${userData.idNumber}`, 40, 40);

        pdf.setFont('helvetica', 'bold');
        pdf.text('Nombres: ', 15, 47);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${userData.firstName}`, 30, 47);

        pdf.setFont('helvetica', 'bold');
        pdf.text('Carrera/Programa: ', 15, 54);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${universityData.program}`, 45, 54);

        pdf.setFont('helvetica', 'bold');
        pdf.text('Modalidad: ', 15, 61);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${universityData.mobilityModality}`, 35, 61);

        pdf.setFont('helvetica', 'bold');
        pdf.text('Nacionalidad: ', 15, 68);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${userData.nationality}`, 40, 68);

        pdf.setFont('helvetica', 'bold');
        pdf.text('Mayor de edad:', 15, 75);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Si ( )  NO ( )', 40, 75);

        pdf.setFont('helvetica', 'bold');
        pdf.text('Grupo de atención prioritaria:', 15, 82);
        pdf.setFont('helvetica', 'normal');
        pdf.text('SI ( )  NO ( )', 60, 82);

        pdf.setFont('helvetica', 'bold');
        pdf.text('Detallar el grupo de atención prioritaria:', 15, 89);
        pdf.setFont('helvetica', 'normal');
        pdf.text('________________________________________', 75, 89);

        // Contenido del compromiso
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const compromiso = `Mediante el presente documento declaro que he solicitado matrícula en la Universidad Técnica Particular de Loja, en el presente período académico, por lo que me comprometo y obligo de forma expresa, libre y voluntaria a:`;
        pdf.text(compromiso, 15, 98, { maxWidth: 180 });

        const compromisos = [
          "Respetar la visión, misión, principios, valores, fines y objetivos institucionales de la Universidad Técnica Particular de Loja de acuerdo con lo establecido en su Estatuto Orgánico.",
          "Cumplir con lo dispuesto en la Ley Orgánica de Educación Superior y sus Reglamentos; el Estatuto Orgánico de la Universidad Técnica Particular de Loja; Reglamento de Régimen Académico Interno; Reglamento de Ética y Régimen Disciplinario; Reglamento Interno para la Regulación de Aranceles, Matrículas y Derechos; y, demás normativa institucional; y, revisar sus actualizaciones periódicas en la página web de Procuraduría Universitaria: https://procuraduria.utpl.edu.ec/.",
          "Cumplir con los procesos presenciales, en línea u otros, para el trámite de matrícula, reconocimiento de estudios, retiro voluntario, retiro por caso fortuito o fuerza mayor y demás trámites académicos, administrativos y financieros establecidos por la Universidad Técnica Particular de Loja, procesos que se realizarán en cada período académico.",
          "Brindar la información personal y académica requerida por la UTPL de forma adecuada y oportuna. La veracidad de la misma es de mi exclusiva responsabilidad.",
          "Entregar los soportes físicos de cualquier documentación requerida en los procesos académicos o administrativos, en los tiempos y forma establecidos por la Universidad Técnica Particular de Loja. En caso de no cumplir con esta entrega, entiendo y acepto que el proceso no tendrá validez y la Universidad Técnica Particular de Loja procederá con las acciones administrativas y académicas correspondientes.",
          "Cumplir con todos los deberes y obligaciones académicas, administrativas y económicas que mi condición de estudiante de la Universidad Técnica Particular de Loja demande y que están establecidos en el Estatuto Orgánico y demás normativa institucional y nacional, dando prioridad a mis estudios hasta completar todos los requisitos para obtener mi título, según la planificación curricular establecida.",
          "Dar buen uso a los bienes e instalaciones de la institución y aquellos bienes públicos o privados que por cualquier motivo estén a cargo de la Universidad Técnica Particular de Loja, comprometiéndome a responder y restituir a la Universidad Técnica Particular de Loja por los daños causados en estos, así como a someterme a los procesos establecidos en el Estatuto Orgánico, Reglamento de Ética y Régimen Disciplinario y demás normativa de la Universidad Técnica Particular de Loja.",
          "Observar un comportamiento responsable, ético y honesto en cada una de mis actividades como miembro de la comunidad universitaria, y de esa manera evitar incurrir en faltas que puedan ser sancionadas en el ámbito disciplinario, académico, administrativo, así como, acciones que contravengan el ordenamiento jurídico ecuatoriano.",
          "Antes de acudir a otras autoridades administrativas, jurisdiccionales o constitucionales, observar y acatar el orden de las instancias universitarias establecidas para presentar mis requerimientos, inquietudes o reclamos, debiendo agotar todas las instancias universitarias que prevé la Ley Orgánica de Educación Superior, el Estatuto Orgánico de la Universidad Técnica Particular de Loja y demás normativa interna.",
          "Utilizar de forma adecuada, personal y exclusivamente para el desarrollo de mis actividades estudiantiles, las herramientas informáticas y sistemas, así como las credenciales de acceso que me proporciona la Universidad Técnica Particular de Loja.",
          "Dar buen uso a toda la información y material proporcionado por la Universidad Técnica Particular de Loja para el desarrollo de mis actividades académicas (incluyendo videos, tareas, archivo digital del examen, evaluaciones, guías, textos, planes académicos, etc.). Conozco y acepto que son para mi uso exclusivo como estudiante de la Universidad Técnica Particular de Loja; por lo tanto, se encuentra prohibido cualquier uso, reproducción, distribución, copia, o cualquier otra acción sin autorización de la Universidad Técnica Particular de Loja.",
          "Cumplir con el requisito de Suficiencia de una Lengua Extranjera en el nivel establecido por la normativa y la Universidad Técnica Particular de Loja, de acuerdo con el Marco Común Europeo.",
          "La dotación de material de bioseguridad para el desarrollo de las actividades académicas presenciales es mi responsabilidad y debe ser asumida con mis propios recursos económicos. En caso de contagio de COVID-19, debo dar aviso de forma inmediata al personal docente o médico de la Universidad para la adopción de las medidas necesarias para evitar su propagación. Además, acepto que cualquier gasto que se genere a causa del contagio de esta enfermedad es de mi exclusiva responsabilidad.",
          "Conozco la declaratoria de la Universidad en la que establece que sus instalaciones son espacios de paz, seguros y libres de tenencia, porte y manejo de armas, explosivos o cualquier otra sustancia o artefacto de similares características y me comprometo a cumplirla.",
          "El Consejo Superior de la UTPL ha aprobado el ajuste no sustantivo en el que la oferta de tercer y cuarto nivel de modalidad “A DISTANCIA” ha cambiado a modalidad “EN LÍNEA”, sin que ello implique una afectación al programa formativo, ni al desarrollo de las actividades académicas de la carrera o programa, por lo que estoy de acuerdo y acepto expresamente este cambio de modalidad a partir del presente periodo académico y por ello continuaré mis estudios de forma habitual.",
          "En calidad de estudiante, declaro de manera voluntaria, clara, precisa e informada que AUTORIZO a la Universidad Técnica Particular de Loja a llevar a cabo la recolección, almacenamiento, uso y circulación de mis datos personales, incluyendo datos sensibles, de conformidad con la Ley Orgánica de Protección de Datos Personales, su reglamento y demás normativa aplicable en esta materia. Asimismo, manifiesto haber sido informado sobre la Política de Privacidad de la Universidad Técnica Particular de Loja, la cual se encuentra disponible en la página web www.utpl.edu.ec.",
          "Aceptar que el incumplimiento de cualquiera de estos compromisos y de otros establecidos en la normativa nacional e institucional aplicable, generará los procesos disciplinarios, administrativos o legales correspondientes. En caso de incumplir el compromiso establecido en el numeral 13 de la presente carta, con el ánimo de precautelar mi salud y bienestar, además la UTPL, podrá suspenderme de manera temporal o definitiva el acceso a las actividades académicas presenciales, pudiendo continuar con mis estudios a través del uso de los medios que implemente la Universidad para tal efecto."
        ];

        let y = 110; // Posición inicial en Y para los compromisos
        const lineHeight = 4; // Espaciado entre líneas

        compromisos.forEach((texto, index) => {
          if (index === 12) { // Antes del compromiso número 13 (índice 12 en array)
            pdf.setFont('helvetica', 'bold');
            pdf.text("Declaro conocer y aceptar de forma libre y voluntaria que:", 15, y);
            y += lineHeight * 2; // Espaciado extra
          }

          pdf.setFont('helvetica', 'bold');
          pdf.text(`${index + 1}.`, 15, y); // Número del compromiso en negrita

          pdf.setFont('helvetica', 'normal');
          const textLines = pdf.splitTextToSize(texto, 165); // Divide el texto en líneas según el ancho
          pdf.text(textLines, 22, y, { align: 'justify', maxWidth: 170 }); // Ajusta la sangría después del número

          y += textLines.length * lineHeight; // Ajustar el espacio dinámicamente

          // Agregar una nueva página si se acerca al final de la hoja
          if (y > 270) {
            pdf.addPage();
            y = 20; // Reiniciar la posición en la nueva página
          }
        });

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.text('Para constancia del presente compromiso y autorización firmo en la ciudad de _____________ a los _______ días del mes de ______________ del año ______', 15, 135, { align: 'justify', maxWidth: 170 });

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.text('Firma:', 15, 160);
        pdf.setFont('helvetica', 'normal');
        pdf.text('________________________________________________', 35, 160);
        pdf.setFont('helvetica', 'bold');
        pdf.text('* Espacio a llenarse por el Representante Legal en caso de estudiantes menores de edad.', 15, 180);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Nombres:', 15, 190);
        pdf.setFont('helvetica', 'normal');
        pdf.text('______________________________', 35, 190);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Apellidos:', 100, 190);
        pdf.setFont('helvetica', 'normal');
        pdf.text('______________________________', 120, 190);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Cédula:', 15, 200);
        pdf.setFont('helvetica', 'normal');
        pdf.text('______________________________', 35, 200);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Firma:', 15, 210);
        pdf.setFont('helvetica', 'normal');
        pdf.text('______________________________', 35, 210);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Vigente período ${universityData.period}`, 130, 290);




        // Convertir el PDF a Base64 y guardarlo en Firebase
        const pdfBlob = pdf.output('blob');
        const reader = new FileReader();
        reader.readAsDataURL(pdfBlob);
        reader.onloadend = () => {
          const base64Pdf = reader.result as string;
          const carta = {
            email: this.userEmail,
            descripcion: 'Carta de Compromiso',
            archivo: base64Pdf,
            fechaIngreso: new Date().toISOString().split('T')[0],
            estado: 'subido'
          };

          // Guardar en Firebase
          this.userDataService.saveCartaAceptacion(this.userEmail, carta).subscribe({
            next: () => {
              alert('Carta de Compromiso generada correctamente.');
              this.obtenerDocumentos();
            },
            error: err => {
              alert('Error al generar la carta: ' + err);
            }
          });
        };
      });
    });
  }


  descargarCartaAceptacion() {
    this.userDataService.getCartaAceptacion(this.email).subscribe(carta => {
      if (carta?.archivo) {
        this.verDocumento(carta.archivo);
      } else {
        alert('No se encontró la carta.');
      }
    });
  }

  onCartaSelected(event: any) {
    this.selectedCartaFile = event.target.files[0] || null;

    if (this.selectedCartaFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.cartaBase64 = reader.result as string;
      };
      reader.readAsDataURL(this.selectedCartaFile);
    }
  }

  subirCartaAceptacion() {
    if (!this.selectedCartaFile) {
      alert('Debe seleccionar un archivo.');
      return;
    }

    const cartaActualizada = {
      email: this.email,
      archivo: this.cartaBase64,
      estado: 'en revisión',
      fechaIngreso: new Date().toISOString().split('T')[0]
    };

    this.userDataService.updateCartaAceptacion(this.email, cartaActualizada).subscribe({
      next: () => {
        alert('Carta subida correctamente.');
        this.obtenerDocumentos();
      },
      error: err => {
        alert('Error al subir la carta: ' + err);
      }
    });
  }




}
