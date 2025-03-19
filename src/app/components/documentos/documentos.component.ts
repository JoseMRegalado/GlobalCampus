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

    const pdf = new jsPDF();
    const fechaActual = new Date().toLocaleDateString('es-ES');

    pdf.setFontSize(12);
    pdf.text('Carta de Aceptación', 105, 20, { align: 'center' });
    pdf.text(fechaActual, 150, 20);
    pdf.text(`Estimado/a`, 20, 50);
    pdf.text('Reciba un cordial saludo de parte de la Universidad Técnica Particular de Loja (UTPL).', 20, 70);
    pdf.text('Su solicitud de participación en el Programa de Movilidad Estudiantil ha sido aceptada.', 20, 80);
    pdf.text('Nos complace darle la bienvenida a nuestra comunidad académica.', 20, 90);
    pdf.text('Atentamente,', 20, 110);
    pdf.text('Global Campus', 20, 120);
    pdf.text('Universidad Técnica Particular de Loja', 20, 130);
    pdf.text('_____________________', 20, 150);
    pdf.text('Firma', 20, 160);

    // Convertir el PDF a Base64
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

      // Guardar la carta en Firebase
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
