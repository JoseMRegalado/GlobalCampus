import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {Router} from "@angular/router";

@Component({
  selector: 'app-admin-view',
  templateUrl: './admin-view.component.html',
  styleUrls: ['./admin-view.component.css']
})
export class AdminViewComponent implements OnInit {
  users: any[] = [];
  currentView: string = 'incoming';

  constructor(private firestore: AngularFirestore, private router: Router) {}

  ngOnInit() {
    this.obtenerUsuarios();
  }

  setView(view: string) {
    this.currentView = view;
  }

  verSeguimiento(userEmail: string) {
    this.router.navigate(['/personal-data'], { queryParams: { userEmail: userEmail } });
  }



  async obtenerUsuarios() {
    try {
      const usersSnapshot = await this.firestore.collection('users').get().toPromise();
      let usersData: any[] = [];

      if (!usersSnapshot) return;

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        console.log(`📌 Procesando usuario: ${userId}`); // 📌 Log para depuración

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

        // Obtener datos universitarios correctamente
        const universityDataRef = personalDataRef.doc('default').collection('universityData');
        const univSnapshot = await universityDataRef.get().toPromise();

        console.log(`🔍 Datos de university-data para ${userId}:`, univSnapshot?.docs.map(doc => doc.data())); // Log de depuración

        if (univSnapshot && !univSnapshot.empty) {
          const univDoc = univSnapshot.docs[0]; // Obtenemos el primer documento
          const univData = univDoc.data() as any;
          userData.university = univData?.universityName || 'N/A';
          userData.period = univData?.period || 'N/A';
        } else {
          console.warn(`⚠️ No se encontraron datos de universidad para ${userId}`);
          userData.university = 'N/A';
          userData.period = 'N/A';
        }

        usersData.push(userData);
      }

      this.users = usersData;
      console.log('✅ Usuarios cargados:', this.users); // Log final
    } catch (error) {
      console.error('❌ Error al obtener los usuarios:', error);
    }
  }
}
