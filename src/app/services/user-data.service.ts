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



  saveCartaAceptacion(email: string, data: any): Observable<void> {
    return new Observable<void>((observer) => {
      this.firestore
        .collection('users')
        .doc(email)
        .collection('docs')
        .add(data) // Guardamos la carta como un documento en la subcolección
        .then(() => observer.next())
        .catch((error) => observer.error(error))
        .finally(() => observer.complete());
    });
  }

  getCartaAceptacion(email: string): Observable<any> {
    return this.firestore
      .collection('users')
      .doc(email)
      .collection('docs', ref => ref.where('descripcion', '==', 'Carta de Aceptación'))
      .get() // Usar get() en lugar de valueChanges para obtener documentos
      .pipe(
        map(snapshot => {
          if (snapshot.empty) {
            console.error('No se encontró la carta de aceptación.');
            return null; // Si no hay documentos, devolvemos null
          } else {
            return snapshot.docs.map(doc => doc.data())[0]; // Retornar el primer documento
          }
        })
      );
  }

  updateCartaAceptacion(email: string, cartaActualizada: any): Observable<void> {
    return new Observable<void>((observer) => {
      // Busca el documento de la carta de aceptación que debe actualizarse
      this.firestore
        .collection('users')
        .doc(email)
        .collection('docs', ref => ref.where('descripcion', '==', 'Carta de Compromiso'))
        .get()
        .toPromise()
        .then((snapshot) => {
          // @ts-ignore
          if (!snapshot.empty) {
            // Obtén el ID del primer documento de carta de aceptación
            // @ts-ignore
            const docId = snapshot.docs[0].id;

            // Reemplaza el documento con la nueva carta
            this.firestore
              .collection('users')
              .doc(email)
              .collection('docs')
              .doc(docId)
              .set(cartaActualizada, { merge: true }) // Actualiza el documento existente
              .then(() => {
                observer.next();
                observer.complete();
              })
              .catch((error) => {
                observer.error(error);
              });
          } else {
            observer.error('No se encontró la carta de aceptación para actualizar.');
          }
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  saveOficio(email: string, base64Pdf: string): Observable<void> {
    const oficio = {
      email,
      descripcion: 'Oficio',
      archivo: base64Pdf,
      fechaIngreso: new Date().toISOString().split('T')[0],
      estado: 'subido'
    };

    return new Observable<void>(observer => {
      this.firestore.collection('users').doc(email).collection('docs').add(oficio)
        .then(() => observer.next())
        .catch(error => observer.error(error))
        .finally(() => observer.complete());
    });
  }

  getOficio(email: string): Observable<any> {
    return this.firestore
      .collection('users')
      .doc(email)
      .collection('docs', ref => ref.where('descripcion', '==', 'Oficio'))
      .valueChanges()
      .pipe(map(docs => (docs.length > 0 ? docs[0] : null)));
  }

  saveCartaCompromiso(email: string, base64Pdf: string): Observable<void> {
    const carta = {
      email,
      descripcion: 'Carta de Aceptación',
      archivo: base64Pdf,
      fechaIngreso: new Date().toISOString().split('T')[0],
      estado: 'subido'
    };

    return new Observable<void>(observer => {
      this.firestore.collection('users').doc(email).collection('docs').add(carta)
        .then(() => observer.next())
        .catch(error => observer.error(error))
        .finally(() => observer.complete());
    });
  }

  getCartaCompromiso(email: string): Observable<any> {
    return this.firestore
      .collection('users')
      .doc(email)
      .collection('docs', ref => ref.where('descripcion', '==', 'Carta de Compromiso'))
      .valueChanges()
      .pipe(map(docs => (docs.length > 0 ? docs[0] : null)));
  }

  actualizarEstadoPostulacion(email: string) {
    return this.firestore.collection('users').doc(email).update({
      estadoPostulacion: 'aprobada'
    }).then(() => {
      console.log('Estado de postulación actualizado a "aprobada"');
    }).catch(error => {
      console.error('Error al actualizar el estado de postulación:', error);
    });
  }

  // Guardar la encuesta en Firestore en la subcolección 'encuesta'
  saveSurvey(email: string, surveyData: any): Observable<void> {
    return new Observable<void>((observer) => {
      this.firestore
        .collection('users')
        .doc(email)
        .collection('encuesta')
        .add(surveyData)
        .then(() => observer.next())
        .catch((error) => observer.error(error))
        .finally(() => observer.complete());
    });
  }

  getUserData1(email: string): Observable<{ proceso: string }> {
    return this.firestore
      .collection('users', ref => ref.where('email', '==', email))
      .snapshotChanges() // Usar snapshotChanges para obtener cambios del documento
      .pipe(
        map(actions => {
          const user = actions.length > 0 ? actions[0].payload.doc.data() : null; // Obtener el primer documento
          // @ts-ignore
          return user ? { proceso: user['proceso'] } : { proceso: '' }; // Verificar si existe el campo 'proceso'
        })
      );
  }

  // Función para subir el certificado de notas
  subirCertificadoNotas(email: string, base64Pdf: string): Observable<void> {
    const certificado = {
      email,
      descripcion: 'Certificado de Notas',
      archivo: base64Pdf,  // Guardando el PDF como base64
      fechaIngreso: new Date().toISOString().split('T')[0],
      estado: 'subido',
    };

    return new Observable<void>((observer) => {
      this.firestore
        .collection('users')
        .doc(email)
        .collection('docs')
        .add(certificado)
        .then(() => observer.next())
        .catch((error) => observer.error(error))
        .finally(() => observer.complete());
    });
  }

  // Obtener el certificado de notas del usuario
  getCertificadoNotas(email: string): Observable<any> {
    return this.firestore
      .collection('users')
      .doc(email)
      .collection('docs', (ref) => ref.where('descripcion', '==', 'Certificado de Notas'))
      .valueChanges()
      .pipe(map((docs) => (docs.length > 0 ? docs[0] : null)));
  }

  // Si tienes alguna función para obtener la encuesta, como un ejemplo:
  getSurvey(email: string): Observable<any> {
    return this.firestore
      .collection('users')
      .doc(email)
      .collection('encuesta')
      .valueChanges()
      .pipe(map((encuestas) => (encuestas.length > 0 ? encuestas[0] : null)));
  }




}
