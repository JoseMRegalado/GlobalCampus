import { Component, OnInit } from '@angular/core';
import { UserDataService } from '../../services/user-data.service';
import { AuthService } from '../../services/login.service';
import { Observable } from 'rxjs';
import {ActivatedRoute} from "@angular/router";
import { jsPDF } from 'jspdf';
import {EncuestaModalComponent} from "../encuesta-modal/encuesta-modal.component";
import { MatDialog } from '@angular/material/dialog';
import { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, Header, Footer, SectionType } from 'docx';
import { saveAs } from 'file-saver';

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
  mostrarBotones = true;
  documentosAprobados: number = 0;
  selectedCartaFile: File | null = null;
  cartaBase64: string = '';
  cartaEstado: string = '';
  cartaSubida: string | null = null;

  oficioGenerado: boolean = false;
  cartaCompromisoSubida: boolean = false;

  cartaCompromisoUrl: string = ''; // Nueva variable para almacenar la URL
  proceso: string = '';

  mostrarEncuesta = false;
  mostrarModal = false;


  encuestaEnviada = false;
  archivoCertificado!: File | null;

  encuestaData: any = null;


  constructor(private userDataService: UserDataService, private authService: AuthService, private route: ActivatedRoute, private dialog: MatDialog ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user?.email) {
        this.email = user.email;

        this.userDataService.getUserRole(this.email).subscribe(role => {
          this.role = role;

          if (this.role === 'admin') {
            this.route.queryParams.subscribe(params => {
              this.userEmail = params['userEmail'] || ''; // Si no hay parámetro, asigna una cadena vacía
              if (!this.userEmail) {
                console.error("Error: userEmail no está definido en los parámetros de la ruta.");
              } else {
                console.log("Admin cargando documentos del usuario:", this.userEmail);
                this.obtenerDocumentos();
                this.obtenerProceso(this.userEmail);
                // Verificar si hay una encuesta para ese email
                this.obtenerEncuesta();
              }
            });
          } else {
            this.userEmail = this.email; // Para usuarios normales, usar su propio email
            console.log("Usuario normal cargando sus documentos:", this.userEmail);
            this.obtenerDocumentos();
            this.obtenerProceso(this.email);
            // Verificar si hay una encuesta para ese email
            this.obtenerEncuesta();
          }
        });
      }
    });
  }

  obtenerProceso(email: string): void {
    this.userDataService.getUserData1(email).subscribe(user => {
      this.proceso = user.proceso; // Asignar el valor de 'proceso'
    });
  }

  obtenerEncuesta() {
    // Llamamos a getSurvey para obtener la encuesta del usuario
    this.userDataService.getSurvey(this.userEmail).subscribe((encuesta) => {
      if (encuesta) {
        this.encuestaEnviada = true;
        this.encuestaData = encuesta; // Guardamos la encuesta
        this.mostrarEncuesta = true; // Mostramos la encuesta en el template
      } else {
        this.encuestaEnviada = false;
        this.mostrarEncuesta = false; // No mostramos la encuesta si no está enviada
      }
    });
  }

  obtenerDocumentos() {
    const emailConsulta = this.role === 'admin' ? this.userEmail : this.email;
    if (!emailConsulta) return;

    this.userDataService.getDocuments(emailConsulta).subscribe(docs => {
      this.documentos = docs;
      this.documentosAprobados = this.documentos.filter(doc => doc.estado === 'aprobado').length;

      // Verificar si existe un documento con la descripción "Carta de Compromiso"
      const tieneCartaCompromiso = this.documentos.some(doc => doc.descripcion === "Carta de Compromiso");

      if (!tieneCartaCompromiso) {
        this.mostrarEncuesta = false;
        localStorage.setItem("mostrarEncuesta", "false");
      } else {
        this.mostrarEncuesta = localStorage.getItem("mostrarEncuesta") === "true";
      }

      // Verificar si existe un documento con la descripción "Carta de Compromiso"
      const tieneCartaAceptacion = this.documentos.some(doc => doc.descripcion === "Carta de Aceptación");

      if (!tieneCartaAceptacion) {
        this.cartaCompromisoSubida = false;
        localStorage.setItem("cartaCompromisoSubida", "false");
      } else {
        this.cartaCompromisoSubida = localStorage.getItem("cartaCompromisoSubida") === "true";
      }

      this.userDataService.getOficio(emailConsulta).subscribe(oficio => {
        this.oficioGenerado = !!oficio;
      });

      this.userDataService.getCartaCompromiso(emailConsulta).subscribe(carta => {
        if (carta?.archivo) {
          this.cartaCompromisoSubida = true;
          localStorage.setItem("cartaCompromisoSubida", "true");
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

        let modalidad;

        if (universityData.mobilityModality === "Presencial") {
          modalidad = "Presencial";
        } else if (universityData.mobilityModality === "Virtual") {
          modalidad = "Abierta o a Distancia";
        } else {
          modalidad = "Modalidad no especificada"; // O algún valor por defecto
        }

        const textoOficio = `Por medio del presente comunico a usted la postulación presentada por el/la estudiante ${userData.firstName} ${userData.lastName}, con identificación N. ${userData.idNumber} de la ${universityData.universityName}, quien desea realizar su Programa de ${universityData.mobilityType} ${universityData.mobilityModality} en nuestra Universidad en la Modalidad ${modalidad}, en el período ${universityData.period}.`;

        pdf.setFont('helvetica', 'normal');
        pdf.text(textoOficio, 20, 80, { maxWidth: 170, align: "justify"});

        // **Materia a validar**
        const materia = universityData.materia || 'Desarrollo basado en Plataformas Móviles';
        pdf.text(
          `El/la estudiante en su contrato de estudios ha seleccionado la siguiente materia, misma que debe ser validada por parte de la Titulación, para proceder con la matrícula y beca:`,
          20, 105, { maxWidth: 170, align: "justify"}
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
  this.mostrarBotones = false;
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

  convertirImagenABase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } else {
          reject('No se pudo obtener el contexto del canvas');
        }
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  async generarCartaCompromiso() {
    if (!this.userEmail) {
      alert('No se encontró el correo del usuario.');
      return;
    }

    try {
      // Cargar las imágenes como ArrayBuffer en lugar de Base64
      const imgEncabezadoBuffer = await this.cargarImagenComoBuffer('assets/img/Imagen1.png');
      const mundoBuffer = await this.cargarImagenComoBuffer('assets/img/Imagen2.png');
      const selloBuffer = await this.cargarImagenComoBuffer('assets/img/Imagen3.png');
      const logoBuffer = await this.cargarImagenComoBuffer('assets/img/Imagen4.png');

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

          // Obtener valores de movilidad
          const mobilityType = universityData.mobilityType || 'Otro';
          const mobilityModality = universityData.mobilityModality || 'Presencial';

          // Definir el contenido según las combinaciones posibles
          let textoCarta = '';

          if (mobilityType === 'Intercambio' && mobilityModality === 'Presencial') {
            textoCarta = `NOTIFICA: \n\nQue ${userData.firstName} ${userData.lastName}, con documento de identidad N. ${userData.idNumber}, estudiante de la ${universityData.universityName}, ha sido aceptado/a para que realice su intercambio presencial en la carrera de ${universityData.program} de nuestra universidad. \n\nEl/la estudiante tomará las siguientes materias de la carrera de ${universityData.program} para el periodo de ${universityData.period}:`;
          } else if (mobilityType === 'Intercambio' && mobilityModality === 'Virtual') {
            textoCarta = `NOTIFICA: \n\nQue ${userData.firstName} ${userData.lastName}, con documento de identidad N. ${userData.idNumber}, estudiante de la ${universityData.universityName}, ha sido aceptado/a para que realice su intercambio en la modalidad abierta y a distancia en la carrera de ${universityData.program} de nuestra universidad. \n\nEl/la estudiante tomará las siguientes materias de la carrera de ${universityData.program} para el periodo de ${universityData.period}:`;
          } else {
            textoCarta = `NOTIFICA: \n\nQue el estudiante ${userData.firstName} ${userData.lastName}, con documento de identidad N. ${userData.idNumber}, de la${universityData.universityName}, ha sido aceptado para que realice ${universityData.mobilityType} en la modalidad ${universityData.mobilityModality} en la carrera de ${universityData.program} de nuestra universidad, en el periodo ${universityData.period}.`;
          }

          const fechaActual = this.formatFecha();

          // Crear un encabezado con la imagen
          const header = new Header({
            children: [
              new Paragraph({
                children: [
                  new ImageRun({
                    data: imgEncabezadoBuffer,
                    transformation: {
                      width: 600,
                      height: 60
                    },
                    type: 'png'
                  })
                ]
              })
            ]
          });

          // Crear un pie de página con la imagen
          const footer = new Footer({
            children: [
              new Paragraph({
                children: [
                  new ImageRun({
                    data: imgEncabezadoBuffer,
                    transformation: {
                      width: 600,
                      height: 60
                    },
                    type: 'png'
                  })
                ]
              })
            ]
          });

          // Crear un nuevo documento con encabezado y pie de página
          const doc = new Document({
            sections: [
              {
                properties: {
                  type: SectionType.NEXT_PAGE
                },
                headers: {
                  default: header,
                },
                footers: {
                  default: footer,
                },
                children: [
                  // Logo
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new ImageRun({
                        data: logoBuffer,
                        transformation: {
                          width: 120,
                          height: 70
                        },
                        type: 'png'
                      })
                    ]
                  }),

                  // Espacio
                  new Paragraph({}),

                  // Encabezado
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'ME.d. Ana Stefanía Bravo Muñoz',
                        bold: true,
                        size: 24
                      })
                    ]
                  }),

                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'DIRECTORA GENERAL DE RELACIONES INTERINSTITUCIONALES',
                        bold: true,
                        size: 24
                      })
                    ]
                  }),

                  // Espacio
                  new Paragraph({}),
                  new Paragraph({}),

                  // Cuerpo de la carta - dividimos el texto en párrafos
                  ...this.textoAParagraphs(textoCarta),

                  // Espacio
                  new Paragraph({}),
                  new Paragraph({}),

                  // Fecha y lugar
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `Se otorga el presente en la ciudad de Loja, el día ${fechaActual}.`,
                        size: 24
                      })
                    ]
                  }),

                  // Marca de agua como imagen (no es una verdadera marca de agua)
                  new Paragraph({
                    alignment: AlignmentType.LEFT,
                    children: [
                      new ImageRun({
                        data: mundoBuffer,
                        transformation: {
                          width: 250,
                          height: 250
                        },
                        type: 'png'
                      })
                    ]
                  }),

                  // Sello
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new ImageRun({
                        data: selloBuffer,
                        transformation: {
                          width: 100,
                          height: 90
                        },
                        type: 'png'
                      })
                    ]
                  }),

                  // Firma
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'ME.d. Ana Stefanía Bravo Muñoz',
                        size: 24
                      })
                    ]
                  }),

                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'Directora General de Relaciones Interinstitucionales',
                        bold: true,
                        size: 24
                      })
                    ]
                  })
                ]
              }
            ]
          });

          // Generar el documento
          Packer.toBlob(doc).then(blob => {
            // Guardar localmente
            saveAs(blob, `Carta_Compromiso_${userData.lastName}.docx`);

            // Convertir a base64 para Firebase
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
              const base64Doc = reader.result as string;
              this.userDataService.saveCartaCompromiso(this.userEmail, base64Doc).subscribe(() => {
                alert('Carta de Compromiso generada y guardada en Firebase.');
                this.cartaCompromisoSubida = true;
                localStorage.setItem("cartaCompromisoSubida", "true");
                this.userDataService.actualizarEstadoPostulacion(this.userEmail);
              });
            };
          });
        });
      });
    } catch (error) {
      console.error('Error al generar la carta de compromiso:', error);
      alert('Error al generar la carta de compromiso. Por favor, inténtelo de nuevo.');
    }
  }

// Método auxiliar para dividir el texto en párrafos
  private textoAParagraphs(texto: string): Paragraph[] {
    return texto.split('\n\n').map(parrafo =>
      new Paragraph({
        children: [
          new TextRun({
            text: parrafo,
            size: 24
          })
        ],
        spacing: {
          after: 200
        }
      })
    );
  }

// Método para cargar imágenes como ArrayBuffer
  private cargarImagenComoBuffer(url: string): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'arraybuffer';

      xhr.onload = function () {
        if (xhr.status === 200) {
          resolve(xhr.response);
        } else {
          reject(new Error('No se pudo cargar la imagen: ' + url));
        }
      };

      xhr.onerror = function () {
        reject(new Error('Error de red al cargar la imagen: ' + url));
      };

      xhr.send();
    });
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

  descargarCartaAceptacion() {
    this.userDataService.getCartaCompromiso(this.email).subscribe(carta => {
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
      fechaIngreso: new Date().toISOString().split('T')[0],
    };

    this.userDataService.updateCartaAceptacion(this.email, cartaActualizada).subscribe({
      next: () => {
        alert('Carta subida correctamente.');
        this.obtenerDocumentos();
        localStorage.setItem("mostrarEncuesta", "true");
        this.mostrarEncuesta = true;
      },
      error: err => {
        alert('Error al subir la carta: ' + err);
      }
    });
  }


  // Función para manejar la selección de un archivo
  onFileSelected1(event: any): void {
    this.selectedFile = event.target.files[0];  // Tomamos el primer archivo seleccionado
  }

  // Función para guardar el archivo PDF en Firebase
  guardarCartaCompromiso(): void {
    if (!this.selectedFile) {
      alert('Por favor, seleccione un archivo primero.');
      return;
    }

    // Leer el archivo como Base64
    const reader = new FileReader();
    reader.readAsDataURL(this.selectedFile);
    reader.onloadend = () => {
      const base64Pdf = reader.result as string;

      // Crear el objeto para guardar en Firebase
      const carta = {
        email: this.userEmail,
        descripcion: 'Carta de Compromiso',
        archivo: base64Pdf,  // Guardamos el archivo en formato Base64
        fechaIngreso: new Date().toISOString().split('T')[0],
        estado: 'subido'
      };

      // Guardar el archivo en Firebase
      this.userDataService.saveCartaAceptacion(this.userEmail, carta).subscribe({
        next: () => {
          alert('Carta de Compromiso guardada correctamente.');
          this.obtenerDocumentos();  // Si es necesario, obtén los documentos

        },
        error: err => {
          alert('Error al guardar la carta: ' + err);
        }
      });
    };
  }

  abrirEncuesta(): void {
    if (!this.userEmail) {
      console.error("Error: userEmail es undefined");
      return;
    }

    this.dialog.open(EncuestaModalComponent, {
      width: '600px',
      data: {
        email: this.userEmail,
        proceso: this.proceso || '' // Evita que proceso sea undefined
      }
    });
  }


  cerrarEncuesta(): void {
    this.mostrarModal = false;
  }

  // Función para seleccionar el archivo del certificado de notas
  onFileSelectedCertificado(event: any) {
    this.archivoCertificado = event.target.files[0];
  }

  // Convertir el archivo a base64 y guardar el certificado
  convertirArchivoABase64(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string); // Base64 result
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Guardar el certificado de notas (en base64)
  async guardarCertificado() {
    if (!this.archivoCertificado) {
      alert('Por favor, selecciona un archivo.');
      return;
    }

    try {
      const base64Pdf = await this.convertirArchivoABase64(this.archivoCertificado);
      this.userDataService
        .subirCertificadoNotas(this.userEmail, base64Pdf)
        .subscribe(
          () => {
            alert('Certificado de notas guardado exitosamente.');
          },
          (error) => {
            alert('Error al guardar el certificado: ' + error);
          }
        );
    } catch (error) {
      alert('Error al convertir el archivo a base64: ' + error);
    }
  }

  // Ver la encuesta enviada (solo para el admin)
  verEncuesta() {
    this.dialog.open(EncuestaModalComponent, {
      width: '600px',
      data: { email: this.userEmail, proceso: 'outgoing', soloLectura: true }
    });
  }


}
