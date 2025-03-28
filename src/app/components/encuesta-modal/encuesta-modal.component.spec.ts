import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncuestaModalComponent } from './encuesta-modal.component';

describe('EncuestaModalComponent', () => {
  let component: EncuestaModalComponent;
  let fixture: ComponentFixture<EncuestaModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EncuestaModalComponent]
    });
    fixture = TestBed.createComponent(EncuestaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
