import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import {AlertaService} from "../../services/alert.service";

@Component({
  selector: 'app-admin-view',
  templateUrl: './admin-view.component.html',
  styleUrls: ['./admin-view.component.css']
})
export class AdminViewComponent implements OnInit {
  users: any[] = [];
  incomingUsers: any[] = [];  // Usuarios sin 'proceso: outgoing'
  outgoingUsers: any[] = [];  // Usuarios con 'proceso: outgoing'
  searchTerm: string = '';
  filteredIncomingUsers: any[] = [];
  filteredOutgoingUsers: any[] = [];


  currentView: string = 'incoming';

  periodos: any[] = [];
  nuevoPeriodo: string = '';


  constructor(private firestore: AngularFirestore, private router: Router, private alertaService: AlertaService ) {}

  ngOnInit() {
    this.obtenerUsuarios();
    this.obtenerPeriodos();
  }

  setView(view: string) {
    this.currentView = view;
  }

  verSeguimiento(userEmail: string) {
    // Comprobamos si estamos en la vista 'incoming' o 'outgoing'
    if (this.currentView === 'incoming') {
      // Si estamos en la vista 'incoming', navegamos a 'personal-data' con los queryParams
      this.router.navigate(['/personal-data'], { queryParams: { userEmail: userEmail } });
    } else if (this.currentView === 'outgoing') {
      // Si estamos en la vista 'outgoing', navegamos a 'out' con los queryParams
      this.router.navigate(['/out'], { queryParams: { userEmail: userEmail } });
    }
  }


  async obtenerUsuarios() {
    try {
      const usersSnapshot = await this.firestore.collection('users').get().toPromise();
      let incomingUsersData: any[] = [];
      let outgoingUsersData: any[] = [];

      if (!usersSnapshot) return;

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;

        const personalDataRef = this.firestore.collection(`users/${userId}/personal-data`);
        let userData: any = { id: userId };

        // Obtener datos personales
        const personalSnapshot = await personalDataRef.get().toPromise();
        if (personalSnapshot && !personalSnapshot.empty) {
          for (const doc of personalSnapshot.docs) {
            const data = doc.data() as any;
            if (doc.id !== 'default') {
              userData.idNumber = data?.idNumber || data?.cedula || 'N/A';
              userData.firstName = data?.firstName || data?.nombres || 'N/A';
              userData.lastName = data?.lastName || data?.apellidos || 'N/A';
              userData.email = data?.email || 'N/A';
              userData.university = data?.universityName || data?.universidadDestino || 'N/A';
              userData.period = data?.period || data?.periodoMovilidad || 'N/A';
            }
          }
        }

        // Obtener datos universitarios
        const universityDataRef = personalDataRef.doc('default').collection('universityData');
        const univSnapshot = await universityDataRef.get().toPromise();
        if (univSnapshot && !univSnapshot.empty) {
          const univDoc = univSnapshot.docs[0]; // Obtenemos el primer documento
          const univData = univDoc.data() as any;
          userData.university = univData?.universityName || univData?.universidadDestino || 'N/A';
          userData.period = univData?.period || univData?.periodoMovilidad || 'N/A';
        } else {
          userData.university = 'N/A';
          userData.period = 'N/A';
        }

        // Verificar el campo 'proceso'
        const userProceso = (userDoc.data() as any)?.proceso;
        if (userProceso === 'outgoing') {
          outgoingUsersData.push(userData); // Usuario con 'outgoing'
        } else {
          incomingUsersData.push(userData); // Usuario sin 'outgoing'
        }



        // Obtener el estadoPostulacion y las fechas del documento de usuario principal
        const userDocData = userDoc.data() as any;
        userData.estadoPostulacion = userDocData.estadoPostulacion || 'pendiente'; // Si no tiene estadoPostulacion, se asigna 'pendiente'
        userData.fechaInicio = userDocData.fechaInicio || '';  // Inicializamos vacío si no tiene
        userData.fechaFin = userDocData.fechaFin || '';  // Inicializamos vacío si no tiene

        // Verificar si el estadoPostulacion está aprobado
        if (userData.estadoPostulacion === 'aprobada') {
          userData.fechasGuardadas = !!(userData.fechaInicio && userData.fechaFin); // Si ambas fechas están guardadas, deshabilitamos los inputs
        }
      }

      // Asignamos los usuarios filtrados
      this.incomingUsers = incomingUsersData.sort((a, b) => {
        const aSinFechas = !a.fechaInicio || !a.fechaFin;
        const bSinFechas = !b.fechaInicio || !b.fechaFin;
        return (aSinFechas === bSinFechas) ? 0 : aSinFechas ? -1 : 1;
      });

      this.outgoingUsers = outgoingUsersData;
      this.filteredIncomingUsers = incomingUsersData.sort((a, b) => {
        const aSinFechas = !a.fechaInicio || !a.fechaFin;
        const bSinFechas = !b.fechaInicio || !b.fechaFin;
        return (aSinFechas === bSinFechas) ? 0 : aSinFechas ? -1 : 1;
      });

      this.filteredOutgoingUsers = outgoingUsersData;

    } catch (error) {
      console.error('❌ Error al obtener los usuarios:', error);
    }
  }

  filterUsers() {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      // Si el campo de búsqueda está vacío, restauramos los datos completos
      this.obtenerUsuarios();
      return;
    }

    const matches = (user: any) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const id = user.idNumber?.toLowerCase() || '';
      const university = user.university?.toLowerCase() || '';
      return fullName.includes(term) || id.includes(term) || university.includes(term);
    };

    if (this.currentView === 'incoming') {
      this.incomingUsers = this.filteredIncomingUsers.filter(matches);
    } else if (this.currentView === 'outgoing') {
      this.outgoingUsers = this.filteredOutgoingUsers.filter(matches);
    }
  }


  guardarFechas(user: any) {
    if (!user.fechaInicio || !user.fechaFin) {
      this.alertaService.mostrarAlerta(
        'error',
        'Debes ingresar ambas fechas.',
        'Por favor ingresa la fecha inicio y fecha fin'
      );
      return;
    }

    // Actualizar en Firebase
    this.firestore.collection('users').doc(user.id).update({
      fechaInicio: user.fechaInicio,
      fechaFin: user.fechaFin
    }).then(() => {
      user.fechasGuardadas = true; // Bloqueamos los inputs tras guardar
      this.alertaService.mostrarAlerta(
        'exito',
        'Fechas guardadas correctamente.',
        'Se han guardado las fechas con éxito'
      );
    }).catch(error => {
      console.error('Error al guardar las fechas:', error);
      this.alertaService.mostrarAlerta(
        'error',
        'Hubo un error al guardar las fechas.',
        'No se guardaron correctamente las fechas'
      );
    });
  }

  guardarComentario(user: any) {
    if (!user.id) return;

    this.firestore.collection('users').doc(user.id).update({
      comentario: user.comentario || ''
    }).then(() => {
      console.log('Comentario guardado correctamente');
    }).catch(error => {
      console.error('Error al guardar comentario:', error);
    });
  }



  // Método para verificar si al menos un usuario tiene estadoPostulacion 'aprobada'
  tieneUsuariosAprobados(): boolean {
    return this.incomingUsers.some(user => user.estadoPostulacion === 'aprobada');
  }

  // Obtener los periodos desde la colección 'periodos'
  obtenerPeriodos() {
    this.firestore.collection('periods').snapshotChanges().subscribe((res) => {
      this.periodos = res.map((doc) => {
        const data = doc.payload.doc.data() as { name: string };
        return {
          id: doc.payload.doc.id,
          name: data.name
        };
      });
    });

  }

// Agregar nuevo periodo
  agregarPeriodo() {
    const name = this.nuevoPeriodo.trim();
    if (!name) return;

    this.firestore.collection('periods').add({ name }).then(() => {
      this.nuevoPeriodo = '';
    });
  }

// Eliminar un periodo
  eliminarPeriodo(id: string) {
    this.firestore.collection('periods').doc(id).delete().then(() => {
      console.log('Periodo eliminado');
    });
  }
}
