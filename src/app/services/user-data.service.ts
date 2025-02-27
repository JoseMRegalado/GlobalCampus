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

  getUserRole(email: string): Observable<string | null> {
    return this.firestore
      .collection('users')
      .doc(email)
      .get()
      .pipe(
        map((docSnapshot) => {
          const data = docSnapshot.data() as { role: string }; // Especifica el tipo
          return docSnapshot.exists ? data.role : null;
        })
      );
  }

  getDocumentReference(userEmail: string, fileType: string): Promise<any> {
    return this.firestore
      .collection('users')
      .doc(userEmail)
      .collection('documents', ref => ref.where('fileType', '==', fileType))
      .get()
      .toPromise()
      .then(snapshot => {
        if (snapshot && !snapshot.empty) {
          const docData = snapshot.docs[0].data(); // 🔹 Ahora devolvemos los datos del documento
          console.log("Documento obtenido:", docData); // 👀 Verifica en la consola
          return docData;
        } else {
          throw new Error('No se encontró un documento con ese tipo de archivo.');
        }
      })
      .catch(error => {
        console.error('Error obteniendo el documento:', error);
        throw error;
      });
  }

  updateUserProcess(email: string, process: string): Observable<void> {
    return new Observable(observer => {
      this.firestore.collection('users').doc(email).update({ process }).then(() => {
        observer.next();
        observer.complete();
      }).catch(err => observer.error(err));
    });
  }





  getAllDocuments(): Observable<any[]> {
    return this.firestore.collectionGroup('docs').valueChanges();
  }




  // Método para guardar un documento en la subcolección 'docs' del usuario
  saveDocument(email: string, data: any): Observable<void> {
    return new Observable<void>((observer) => {
      this.firestore
        .collection('users')
        .doc(email)
        .collection('docs')
        .add(data)
        .then(() => observer.next())
        .catch((error) => observer.error(error))
        .finally(() => observer.complete());
    });
  }

// Método para obtener todos los documentos de la subcolección 'docs' del usuario
  getDocuments(email: string): Observable<any[]> {
    return this.firestore
      .collection('users')
      .doc(email)
      .collection('docs')
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => {
            const id = a.payload.doc.id;
            const data = a.payload.doc.data();
            return { id, ...data };
          })
        )
      );
  }





// Método para actualizar un documento específico en la subcolección 'docs'
  updateDocument(email: string, docId: string, data: any): Observable<void> {
    return new Observable<void>((observer) => {
      this.firestore
        .collection('users')
        .doc(email)
        .collection('docs')
        .doc(docId)
        .set(data, { merge: true }) // Actualiza solo los campos modificados
        .then(() => observer.next())
        .catch((error) => observer.error(error))
        .finally(() => observer.complete());
    });
  }


  // Obtener todos los usuarios
  getAllUsers(): Observable<any[]> {
    return this.firestore.collection('users').valueChanges();
  }

  getDocumentNames(userEmail: string): Observable<string[]> {
    return this.firestore.collection('users')
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => a.payload.doc.id))
      );
  }









}
