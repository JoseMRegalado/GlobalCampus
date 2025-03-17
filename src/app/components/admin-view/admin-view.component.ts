import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-view',
  templateUrl: './admin-view.component.html',
  styleUrls: ['./admin-view.component.css']
})
export class AdminViewComponent implements OnInit {
  users: any[] = [];
  incomingUsers: any[] = [];  // Usuarios sin 'proceso: outgoing'
  outgoingUsers: any[] = [];  // Usuarios con 'proceso: outgoing'
  currentView: string = 'incoming';

  constructor(private firestore: AngularFirestore, private router: Router) {}

  ngOnInit() {
    this.obtenerUsuarios();
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
              userData.idNumber = data?.idNumber || 'N/A';
              userData.firstName = data?.firstName || 'N/A';
              userData.lastName = data?.lastName || 'N/A';
              userData.email = data?.email || 'N/A';
            }
          }
        }

        // Obtener datos universitarios
        const universityDataRef = personalDataRef.doc('default').collection('universityData');
        const univSnapshot = await universityDataRef.get().toPromise();
        if (univSnapshot && !univSnapshot.empty) {
          const univDoc = univSnapshot.docs[0]; // Obtenemos el primer documento
          const univData = univDoc.data() as any;
          userData.university = univData?.universityName || 'N/A';
          userData.period = univData?.period || 'N/A';
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
      this.incomingUsers = incomingUsersData;
      this.outgoingUsers = outgoingUsersData;
    } catch (error) {
      console.error('❌ Error al obtener los usuarios:', error);
    }
  }

  guardarFechas(user: any) {
    if (!user.fechaInicio || !user.fechaFin) {
      alert('Debes ingresar ambas fechas.');
      return;
    }

    // Actualizar en Firebase
    this.firestore.collection('users').doc(user.id).update({
      fechaInicio: user.fechaInicio,
      fechaFin: user.fechaFin
    }).then(() => {
      user.fechasGuardadas = true; // Bloqueamos los inputs tras guardar
      alert('Fechas guardadas correctamente.');
    }).catch(error => {
      console.error('Error al guardar las fechas:', error);
      alert('Hubo un error al guardar las fechas.');
    });
  }

  // Método para verificar si al menos un usuario tiene estadoPostulacion 'aprobada'
  tieneUsuariosAprobados(): boolean {
    return this.incomingUsers.some(user => user.estadoPostulacion === 'aprobada');
  }
}
