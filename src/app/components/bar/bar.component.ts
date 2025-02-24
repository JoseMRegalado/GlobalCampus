import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/login.service'; // Asegúrate de importar tu servicio de autenticación

@Component({
  selector: 'app-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.css']
})
export class BarComponent implements OnInit {
  userId: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Obtener el ID del usuario autenticado
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userId = user.uid; // Aquí se obtiene el ID del usuario de Firebase
      }
    });
  }
}
