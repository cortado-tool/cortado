import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceProgressBarComponent } from './performance-progress-bar.component';

describe('PerformanceProgressBarComponent', () => {
  let component: PerformanceProgressBarComponent;
  let fixture: ComponentFixture<PerformanceProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PerformanceProgressBarComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformanceProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
