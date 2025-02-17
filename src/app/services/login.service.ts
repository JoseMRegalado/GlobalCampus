import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import {BehaviorSubject, Observable} from "rxjs";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedIn = new BehaviorSubject<boolean>(false);

  constructor(private afAuth: AngularFireAuth, private firestore: AngularFirestore) {

    this.afAuth.authState.subscribe(user => {
      this.isLoggedIn.next(!!user);
    });
  }
  get isLoggedIn$(): Observable<boolean> {
    return this.isLoggedIn.asObservable();
  }

  // Login con correo y contraseña
  loginWithEmail(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  // Registro con correo y contraseña
  registerWithEmail(email: string, password: string) {
    return this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  // Login con Google
  loginWithGoogle() {
    return this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  // Logout
  logout() {
    return this.afAuth.signOut();
  }



  // Obtener usuario actual
  getCurrentUser() {
    return this.afAuth.authState;
  }
}
