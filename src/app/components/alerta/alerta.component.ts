import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-alerta',
  templateUrl: './alerta.component.html',
  styleUrls: ['./alerta.component.css']
})
export class AlertaComponent {
  @Input() visible: boolean = false;
  @Input() titulo: string = '¡Éxito!';
  @Input() mensaje: string = 'La operación se realizó correctamente.';
  @Input() tipo: 'exito' | 'error' | 'info' | 'advertencia' = 'exito';
  @Input() icono: string = ''; // emoji o ícono personalizado
  @Input() autoCerrar: boolean = true;
  @Input() tiempo: number = 3000; // tiempo en ms

  @Output() cerrado = new EventEmitter<void>();

  ngOnChanges() {
    if (this.visible && this.autoCerrar) {
      setTimeout(() => {
        this.visible = false;
        this.cerrado.emit();
      }, this.tiempo);
    }
  }

  cerrarManual() {
    this.visible = false;
    this.cerrado.emit();
  }

}
