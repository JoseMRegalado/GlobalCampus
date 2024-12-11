import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  constructor(private firestore: AngularFirestore) {}

  // Guardar datos del usuario en la subcolección 'personal-data' dentro de 'users'
  saveUserData(data: any): Observable<void> {
    const userId = data.email; // Usa el correo como identificador único
    if (!userId) {
      return of(); // Devuelve un observable vacío si no hay identificador
    }

    return new Observable<void>((observer) => {
      this.firestore
        .collection('users') // Colección principal
        .doc(userId) // Documento con el identificador del usuario
        .collection('personal-data') // Subcolección 'personal-data'
        .add(data) // Agregar los datos como un nuevo documento
        .then(() => observer.next())
        .catch((error) => observer.error(error))
        .finally(() => observer.complete());
    });
  }
}
