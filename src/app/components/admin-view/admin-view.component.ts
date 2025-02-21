import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-admin-view',
  templateUrl: './admin-view.component.html',
  styleUrls: ['./admin-view.component.css']
})
export class AdminViewComponent implements OnInit {
  users: any[] = [];
  currentView: string = 'incoming';

  constructor(private firestore: AngularFirestore) {}

  ngOnInit() {
    this.obtenerUsuarios();
  }

  setView(view: string) {
    this.currentView = view;
  }

  async obtenerUsuarios() {
    try {
      const usersSnapshot = await this.firestore.collection('users').get().toPromise();
      let usersData: any[] = [];

      if (!usersSnapshot) return;

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const personalDataRef = this.firestore.collection(`users/${userId}/personal-data`);

        let userData: any = { id: userId };

        // Obtener datos personales
        const personalSnapshot = await personalDataRef.get().toPromise();
        if (personalSnapshot) {
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
        const universityDataRef = personalDataRef.doc('default').collection('university-data');
        const univSnapshot = await universityDataRef.get().toPromise();
        if (univSnapshot) {
          for (const univDoc of univSnapshot.docs) {
            const univData = univDoc.data() as any;
            userData.university = univData?.universityName || 'N/A';
            userData.period = univData?.period || 'N/A';
          }
        }

        usersData.push(userData);
      }

      this.users = usersData;
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
    }
  }
}
