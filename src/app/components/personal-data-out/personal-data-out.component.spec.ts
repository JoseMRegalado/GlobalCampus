import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalDataOutComponent } from './personal-data-out.component';

describe('PersonalDataOutComponent', () => {
  let component: PersonalDataOutComponent;
  let fixture: ComponentFixture<PersonalDataOutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PersonalDataOutComponent]
    });
    fixture = TestBed.createComponent(PersonalDataOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
