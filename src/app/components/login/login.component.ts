import { Component } from '@angular/core';
import { AuthService } from '../../services/login.service';
import { Router } from '@angular/router';
import {BehaviorSubject} from "rxjs";
import {UserDataService} from "../../services/user-data.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  private isLoggedIn = new BehaviorSubject<boolean>(false);


  constructor(private authService: AuthService, private router: Router, private userDataService: UserDataService) {}

  login() {
    this.authService.loginWithEmail(this.email, this.password).then(() => {
      this.userDataService.getUserRole(this.email).subscribe(role => {
        if (role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/home']);
        }
      });
    }).catch(error => alert(error.message));
  }

  loginWithGoogle() {
    this.authService.loginWithGoogle().then((userCredential) => {
      // After successful Google login, get the user's email
      const email = userCredential?.user?.email;
      if (email) {
        this.userDataService.getUserRole(email).subscribe(role => {
          if (role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/home']);
          }
        });
      } else {
        // Handle the case where the email is not available
        console.error('Email not found after Google login.');
        this.router.navigate(['/home']); // Or some other default route
      }
    }).catch(error => alert(error.message));
  }
}
