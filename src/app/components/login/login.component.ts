import { Component } from '@angular/core';
import { AuthService } from '../../services/login.service';
import { Router } from '@angular/router';
import {BehaviorSubject} from "rxjs";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  private isLoggedIn = new BehaviorSubject<boolean>(false);


  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.loginWithEmail(this.email, this.password).then(() => {
      this.router.navigate(['/personal-data']);
    }).catch(error => alert(error.message));
  }

  loginWithGoogle() {
    this.authService.loginWithGoogle().then(() => {
      this.router.navigate(['/personal-data']);
    }).catch(error => alert(error.message));
  }
}
