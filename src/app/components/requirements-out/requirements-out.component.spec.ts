import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementsOutComponent } from './requirements-out.component';

describe('RequirementsOutComponent', () => {
  let component: RequirementsOutComponent;
  let fixture: ComponentFixture<RequirementsOutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RequirementsOutComponent]
    });
    fixture = TestBed.createComponent(RequirementsOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
