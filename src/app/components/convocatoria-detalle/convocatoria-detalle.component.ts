import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-convocatoria-detalle',
  templateUrl: './convocatoria-detalle.component.html',
  styleUrls: ['./convocatoria-detalle.component.css']
})
export class ConvocatoriaDetalleComponent {
  data: any;

  constructor(private location: Location) {
    const navigation = window.history.state;
    this.data = navigation.data;
  }

  volver() {
    this.location.back();
  }
}
