import { Component } from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {Router} from "@angular/router";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {

  constructor(private router: Router) {}

  facebook() {
      this.router.navigate(['https://www.facebook.com/utplglobalcampus']);
  }

  instagram() {
    this.router.navigate(['https://www.facebook.com/utplglobalcampus']);
  }

  twitter() {
    this.router.navigate(['https://www.facebook.com/utplglobalcampus']);
  }

}
