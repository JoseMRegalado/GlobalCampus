import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/login.service';
import { ActivatedRoute } from '@angular/router';
import { UserDataService } from 'src/app/services/user-data.service';

@Component({
  selector: 'app-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.css']
})
export class BarComponent implements OnInit {
  email: string | null = null;
  isAdmin: boolean = false;

  constructor(private authService: AuthService, private route: ActivatedRoute, private userService: UserDataService) {}

  ngOnInit(): void {
    const emailFromUrl = this.route.snapshot.queryParams['userEmail'];
    console.log('Email en la URL:', emailFromUrl);

    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        // Evaluamos si el usuario loggeado es admin
        // @ts-ignore
        this.userService.getUserRole(user.email).subscribe(role => {
          this.isAdmin = role === 'admin';

          if (this.isAdmin) {
            // Si el usuario loggeado es admin, usamos el email de la URL (si existe)
            this.email = emailFromUrl || user.email;
          } else {
            // Si NO es admin, usamos el email del usuario loggeado
            this.email = user.email;
          }

          // Asegurarnos de que `this.email` no es `null` antes de usarlo
          if (this.email) {
            console.log('¿Es admin?:', this.isAdmin);
            console.log('Email asignado:', this.email);
          } else {
            console.error('No se pudo asignar un email válido.');
          }
        });
      }
    });
  }
}
