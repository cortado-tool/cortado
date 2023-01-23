import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnavailableInfoComponent } from './unavailable-info.component';

describe('UnavailableInfoComponent', () => {
  let component: UnavailableInfoComponent;
  let fixture: ComponentFixture<UnavailableInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnavailableInfoComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnavailableInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
