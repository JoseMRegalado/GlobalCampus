import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovilidadFormComponent } from './movilidad-form.component';

describe('MovilidadFormComponent', () => {
  let component: MovilidadFormComponent;
  let fixture: ComponentFixture<MovilidadFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MovilidadFormComponent]
    });
    fixture = TestBed.createComponent(MovilidadFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
