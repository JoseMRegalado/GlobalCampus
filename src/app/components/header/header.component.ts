import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/login.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  constructor(private router: Router, private authService: AuthService) {}

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/home']);
    });
  }
}
