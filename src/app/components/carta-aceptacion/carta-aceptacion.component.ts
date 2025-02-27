import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserDataService } from '../../services/user-data.service';
import { AuthService } from '../../services/login.service';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-carta-aceptacion',
  templateUrl: './carta-aceptacion.component.html',
  styleUrls: ['./carta-aceptacion.component.css']
})
export class CartaAceptacionComponent implements OnInit {
  userEmail: string | null = null; // Email del usuario logueado
  queryUserEmail: string | null = null; // Email del usuario en queryParams
  personalData: any = {};
  universityData: any = {};
  isAdmin: boolean = false; // Si el usuario es admin
  selectedFile: File | null = null;
  pdfUploading: boolean = false;
  currentDate = new Date();
  generatedDocument: any = null; // Almacena el documento generado para la descarga

  constructor(
    private authService: AuthService,
    private userDataService: UserDataService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.userEmail = user?.email || null;
      if (this.userEmail) {
        // Obtener el rol del usuario
        this.userDataService.getUserRole(this.userEmail).subscribe(role => {
          this.isAdmin = role === 'admin';

          // Si el usuario es admin, obtenemos el email de los queryParams
          if (this.isAdmin) {
            this.queryUserEmail = this.route.snapshot.queryParams['userEmail'] || null;
          } else {
            this.queryUserEmail = this.userEmail; // Si no es admin, usa su propio email
          }

          if (this.queryUserEmail) {
            this.loadData();
            this.loadGeneratedDocument();
          }
        });
      }
    });
  }

  loadData() {
    if (this.queryUserEmail) {
      this.userDataService.getUserData(this.queryUserEmail).subscribe(data => {
        this.personalData = data || {};
      });

      this.userDataService.getUniversityData(this.queryUserEmail).subscribe(data => {
        this.universityData = data || {};
      });
    }
  }

  // Cargar la carta de aceptación generada previamente
  loadGeneratedDocument() {
    if (this.queryUserEmail) {
      this.userDataService.getDocumentReference(this.queryUserEmail, 'Carta de Aceptación')
        .then(doc => {
          console.log("Documento encontrado:", doc); // ✅ Verifica si realmente devuelve datos
          this.generatedDocument = doc;
        })
        .catch(error => {
          console.warn("No se encontró el documento:", error);
        });
    }
  }



  // Generar la carta de aceptación y guardarla en la base de datos
  generatePdf() {
    if (!this.personalData || !this.personalData.firstName) {
      alert('No hay datos para generar la carta.');
      return;
    }

    const pdf = new jsPDF();
    const formattedDate = this.currentDate.toLocaleDateString('es-ES');

    pdf.setFontSize(12);
    pdf.text('Carta de Aceptación', 105, 20, { align: 'center' });
    pdf.text(formattedDate, 150, 20);
    pdf.text(`${this.personalData.firstName || ''} ${this.personalData.lastName || ''}`, 20, 50);
    pdf.text('Loja, Ecuador', 20, 60);
    pdf.text(`Estimado/a señor/a ${this.personalData.lastName || ''},`, 20, 70);
    pdf.text('Reciba un cordial saludo de parte de la Universidad Técnica Particular de Loja (UTPL).', 20, 90);
    pdf.text('Su solicitud de participación en el Programa de Movilidad Estudiantil ha sido aceptada.', 20, 100);
    pdf.text('Nos complace darle la bienvenida a nuestra comunidad académica.', 20, 110);
    pdf.text('Atentamente,', 20, 130);
    pdf.text('Global Campus', 20, 140);
    pdf.text('Universidad Técnica Particular de Loja', 20, 150);
    pdf.text('_____________________', 20, 180);
    pdf.text('Firma', 20, 190);

    // Convertir el PDF a Base64 y guardarlo en la base de datos
    const pdfBlob = pdf.output('blob');
    const reader = new FileReader();
    reader.readAsDataURL(pdfBlob);
    reader.onloadend = () => {
      const base64Pdf = reader.result as string;
      const documentData = {
        fileName: `Carta_Aceptacion_${this.queryUserEmail}.pdf`,
        fileContent: base64Pdf,
        uploadedAt: new Date(),
        fileType: 'Carta de Aceptación'
      };

      this.userDataService.saveDocumentReference(this.queryUserEmail!, documentData).subscribe({
        next: () => {
          alert('Carta de aceptación generada y guardada correctamente.');
          this.loadGeneratedDocument(); // Recargar el documento generado
        },
        error: err => {
          alert('Error al guardar la carta: ' + err);
        }
      });
    };
  }

  // Descargar la carta generada
  downloadGeneratedPdf() {
    if (this.generatedDocument && this.generatedDocument.fileContent) {
      const link = document.createElement('a');
      link.href = this.generatedDocument.fileContent;
      link.download = this.generatedDocument.fileName;
      link.click();
    } else {
      alert('No hay carta disponible para descargar.');
    }
  }

  // Permite seleccionar el archivo firmado
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  // Limpiar archivo seleccionado
  clearFile(): void {
    this.selectedFile = null;
  }

  // Subir el archivo firmado en formato Base64
  uploadSignedPdf() {
    if (!this.queryUserEmail || !this.selectedFile) {
      alert('Debe seleccionar un archivo para subir.');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.selectedFile);
    reader.onload = () => {
      const base64File = reader.result as string;

      const documentData = {
        fileName: this.selectedFile!.name,
        fileContent: base64File,
        uploadedAt: new Date(),
        fileType: 'Carta de Aceptación Firmada'
      };

      this.pdfUploading = true;

      this.userDataService.saveDocumentReference(this.queryUserEmail!, documentData).subscribe({
        next: () => {
          this.pdfUploading = false;
          alert('Documento firmado subido correctamente.');
          this.selectedFile = null;
        },
        error: err => {
          this.pdfUploading = false;
          alert('Error al subir el documento: ' + err);
        }
      });
    };
  }
}
