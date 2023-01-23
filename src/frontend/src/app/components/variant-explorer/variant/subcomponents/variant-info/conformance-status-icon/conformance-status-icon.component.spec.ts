import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConformanceStatusIconComponent } from './conformance-status-icon.component';

describe('ConformanceStatusIconComponent', () => {
  let component: ConformanceStatusIconComponent;
  let fixture: ComponentFixture<ConformanceStatusIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConformanceStatusIconComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConformanceStatusIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
