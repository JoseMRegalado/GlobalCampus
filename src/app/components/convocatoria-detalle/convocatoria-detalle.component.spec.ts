import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvocatoriaDetalleComponent } from './convocatoria-detalle.component';

describe('ConvocatoriaDetalleComponent', () => {
  let component: ConvocatoriaDetalleComponent;
  let fixture: ComponentFixture<ConvocatoriaDetalleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConvocatoriaDetalleComponent]
    });
    fixture = TestBed.createComponent(ConvocatoriaDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
