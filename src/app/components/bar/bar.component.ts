import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/login.service';
import { ActivatedRoute } from '@angular/router';
import { UserDataService } from 'src/app/services/user-data.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.css']
})
export class BarComponent implements OnInit {
  email: string | null = null;
  isAdmin: boolean = false;
  showNewSteps: boolean = false;  // Variable para manejar la barra de pasos nuevos

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private userService: UserDataService,
    private firestore: AngularFirestore
  ) {}

  ngOnInit(): void {
    const emailFromUrl = this.route.snapshot.queryParams['userEmail'];

    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        // Verificamos si el usuario logueado es admin
        // @ts-ignore
        this.userService.getUserRole(user.email).subscribe(role => {
          this.isAdmin = role === 'admin';

          // Asignamos el email de acuerdo con el rol
          this.email = emailFromUrl || user.email;

          if (this.email) {
            // Verificamos si el usuario tiene el campo 'proceso'
            this.firestore.collection('users').doc(this.email).get().toPromise().then(doc => {
              // @ts-ignore
              if (doc.exists) {
                // @ts-ignore
                const userData = doc.data() as any; // Acceso dinámico con 'as any'

                // Verificamos si el campo 'proceso' existe y es 'outgoing'
                const userProceso = userData?.proceso;
                if (userProceso === 'outgoing') {
                  this.showNewSteps = true;  // Si tiene 'proceso: outgoing', mostramos la barra nueva
                } else {
                  this.showNewSteps = false;  // Si no tiene 'proceso' o no es 'outgoing', mantenemos la barra estándar
                }
              }
            }).catch(error => {
              console.error('Error al obtener los datos del usuario:', error);
            });
          } else {
            console.error('No se pudo asignar un email válido.');
          }
        });
      }
    });
  }
}
