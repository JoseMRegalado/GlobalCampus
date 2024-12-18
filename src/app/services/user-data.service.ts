import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import {map} from "rxjs/operators";

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

  saveUniversityData(data: any): Observable<void> {
    const userId = data.email; // Usa el correo como identificador único
    if (!userId) {
      return of(); // Devuelve un observable vacío si no hay identificador
    }

    return new Observable<void>((observer) => {
      this.firestore
        .collection('users') // Colección principal
        .doc(userId)// Documento del usuario
        .collection('personal-data')
        .doc('default')
        .collection('universityData') // Subcolección
        .add(data) // Agregar los datos como un nuevo documento
        .then(() => observer.next())
        .catch((error) => observer.error(error))
        .finally(() => observer.complete());
    });
  }

  getUserData(email: string): Observable<any> {
    return this.firestore
      .collection('users')
      .doc(email)
      .collection('personal-data')
      .get()
      .pipe(
        map(snapshot => snapshot.docs.length > 0 ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } : null)
      );
  }


  updateUserData(email: string, data: any): Observable<void> {
    const docId = data.id; // ID del documento a actualizar
    delete data.id; // Elimina el campo `id` para evitar problemas al guardar
    return new Observable<void>((observer) => {
      this.firestore
        .collection('users')
        .doc(email)
        .collection('personal-data')
        .doc(docId)
        .set(data, { merge: true }) // Actualizar el documento existente
        .then(() => observer.next())
        .catch((error) => observer.error(error))
        .finally(() => observer.complete());
    });
  }


  getUniversityData(email: string): Observable<any> {
    return this.firestore
      .collection('users')
      .doc(email)
      .collection('personal-data')
      .doc('default')
      .collection('universityData')
      .get()
      .pipe(
        map(snapshot => snapshot.docs.length > 0 ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } : null)
      );
  }

  updateUniversityData(email: string, data: any): Observable<void> {
    const docId = data.id; // ID del documento a actualizar
    delete data.id; // Elimina el campo `id` para evitar problemas al guardar
    return new Observable<void>((observer) => {
      this.firestore
        .collection('users')
        .doc(email)
        .collection('personal-data')
        .doc('default')
        .collection('universityData')
        .doc(docId)
        .set(data, { merge: true }) // Actualizar el documento existente
        .then(() => observer.next())
        .catch((error) => observer.error(error))
        .finally(() => observer.complete());
    });
  }

  saveDocumentReference(email: string, data: any): Observable<void> {
    return new Observable<void>((observer) => {
      this.firestore
        .collection('users')
        .doc(email)
        .collection('documents')
        .add(data)
        .then(() => observer.next())
        .catch((error) => observer.error(error))
        .finally(() => observer.complete());
    });
  }







}
