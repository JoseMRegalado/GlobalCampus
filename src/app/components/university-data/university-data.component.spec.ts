import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniversityDataComponent } from './university-data.component';

describe('UniversityDataComponent', () => {
  let component: UniversityDataComponent;
  let fixture: ComponentFixture<UniversityDataComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UniversityDataComponent]
    });
    fixture = TestBed.createComponent(UniversityDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
