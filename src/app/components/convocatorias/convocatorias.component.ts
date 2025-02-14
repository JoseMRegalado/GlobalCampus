import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-convocatorias',
  templateUrl: './convocatorias.component.html',
  styleUrls: ['./convocatorias.component.css']
})
export class ConvocatoriasComponent implements OnInit {
  slides: any[] = [];

  constructor(private firestore: AngularFirestore, private router: Router) {}

  ngOnInit() {
    this.firestore
      .collection('convocatorias')
      .valueChanges()
      .subscribe(data => {
        this.slides = data; // Guardamos los datos de Firebase en la variable slides
      });
  }

  verDetalles(slide: any) {
    this.router.navigate(['/convocatoria-detalle'], { state: { data: slide } });
  }
}
