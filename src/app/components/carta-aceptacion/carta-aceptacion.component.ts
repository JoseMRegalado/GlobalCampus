import { Component, OnInit } from '@angular/core';
import { UserDataService } from '../../services/user-data.service';
import { AuthService } from '../../services/login.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { jsPDF } from 'jspdf';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-carta-aceptacion',
  templateUrl: './carta-aceptacion.component.html',
  styleUrls: ['./carta-aceptacion.component.css']
})
export class CartaAceptacionComponent implements OnInit {
  userEmail: string | null = null;
  personalData: any = {};
  universityData: any = {};
  selectedFile: File | null = null; // Archivo seleccionado para subir
  pdfUploading: boolean = false;
  currentDate = new Date();

  constructor(
    private authService: AuthService,
    private userDataService: UserDataService
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.userEmail = user?.email || null;
      if (this.userEmail) {
        this.loadData();
      }
    });
  }

  loadData() {
    if (this.userEmail) {
      this.userDataService.getUserData(this.userEmail).subscribe(data => {
        this.personalData = data || {};
      });

      this.userDataService.getUniversityData(this.userEmail).subscribe(data => {
        this.universityData = data || {};
      });
    }
  }
  clearFile(): void {
    this.selectedFile = null;
  }





  // Generar el PDF y abrirlo en una pestaña
  generatePdf() {
    const pdf = new jsPDF();
    const formattedDate = this.currentDate.toLocaleDateString('es-ES');

    // Contenido del PDF
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


    // Abrir el PDF en una nueva pestaña
    const pdfOutput = pdf.output('blob');
    const url = URL.createObjectURL(pdfOutput);
    window.open(url, '_blank');
  }

  // Manejar la selección de archivo
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  // Subir el archivo firmado a Firestore
  uploadSignedPdf() {
    if (!this.userEmail || !this.selectedFile) {
      alert('Debe seleccionar un archivo para subir.');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.selectedFile);
    reader.onload = () => {
      const base64File = reader.result as string;

      const documentData = {
        fileName: this.selectedFile!.name,
        fileContent: base64File, // Guardar el archivo firmado como Base64
        uploadedAt: new Date(),
        fileType: 'Carta de Aceptación Firmada'
      };

      this.pdfUploading = true;

      this.userDataService.saveDocumentReference(this.userEmail!, documentData).subscribe({
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
