import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/login.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  isLoggedIn: boolean = false;
  userEmail: string | null = null; // Para almacenar el correo del usuario

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;

      if (this.isLoggedIn) {
        this.authService.getCurrentUser().subscribe(user => {
          if (user) {
            this.userEmail = user.email; // Asignar el correo del usuario loggeado
          }
        });
      } else {
        this.userEmail = null; // Si no está loggeado, el email es null
      }
    });
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/home']);
    });
  }

  menuOpen = false;
  botonOpen: boolean = false;

  toggleMenu() {
    this.botonOpen = !this.botonOpen;
  }

  toggleNav() {
    this.menuOpen = !this.menuOpen;
  }
}
