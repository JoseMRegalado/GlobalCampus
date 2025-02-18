import { Component, OnInit } from '@angular/core';
import { UserDataService } from '../../services/user-data.service';
import { AuthService } from '../../services/login.service';
import { Observable } from 'rxjs';

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


  constructor(private userDataService: UserDataService, private authService: AuthService) {}

  ngOnInit() {
    this.fechaActual = new Date().toISOString().split('T')[0];
    // Obtener usuario actual
    this.authService.getCurrentUser().subscribe(user => {
      if (user?.email) {
        this.email = user.email;
        // Obtener rol del usuario
        this.userDataService.getUserRole(this.email).subscribe(role => {
          this.role = role;
          if (this.role === 'admin') {
            this.obtenerNombresDocumentos();
          }
          // Obtener documentos del usuario
          this.obtenerDocumentos();
        });
      }
    });
  }

  obtenerNombresDocumentos() {
    this.userDataService.getDocumentNames(this.email).subscribe(nombres => {
      this.documentosNombres = nombres;
    });
  }

  // Obtener documentos
  obtenerDocumentos() {
    // Si es admin y seleccionó un usuario
    if (this.role === 'admin' && this.usuarioSeleccionado) {
      this.userDataService.getDocuments(this.usuarioSeleccionado).subscribe(docs => {
        console.log('Documentos obtenidos:', docs); // Verifica que el id esté presente
        this.documentos = docs;
      });
    } else if (this.role === 'admin') {
      // Si es admin y seleccionó "Todos"
      this.userDataService.getAllDocuments().subscribe(docs => {
        console.log('Todos los documentos:', docs); // Verifica el id aquí también
        this.documentos = docs;
      });
    } else {
      // Si es un usuario normal
      this.userDataService.getDocuments(this.email).subscribe(docs => {
        console.log('Documentos del usuario:', docs); // Verifica el id aquí
        this.documentos = docs;
      });
    }
  }

// Obtener todos los usuarios (Solo para admin)
  obtenerUsuarios() {
    this.userDataService.getAllUsers().subscribe(users => {
      this.usuarios = users;
    });
  }


  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] || null;

    if (this.selectedFile) { // Verificamos que no sea null
      const reader = new FileReader();
      reader.onload = () => {
        this.archivoBase64 = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }




  cargarDocumento() {
    if (!this.email || !this.selectedFile) {
      alert('Debe seleccionar un archivo para subir.');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.selectedFile);
    reader.onload = () => {
      const base64File = reader.result as string;

      const nuevoDocumento = {
        email: this.email,  // Agregar el email del usuario
        descripcion: this.descripcion,
        archivo: base64File, // Guardar el archivo como Base64
        fechaIngreso: new Date().toISOString().split('T')[0],
        fechaValidacion: '',
        observaciones: '',
        estado: 'pendiente'
      };

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
    };
  }


  validarDocumento(doc: any) {
    const data = {
      ...doc,
      status: 'validado'
    };

    console.log('Documento a validar:', data); // Verifica que el id esté presente

    this.userDataService.updateDocument(doc.email, doc.id, data).subscribe({
      next: () => console.log('Documento validado con éxito'),
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

}
