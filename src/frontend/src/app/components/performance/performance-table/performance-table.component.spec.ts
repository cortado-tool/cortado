import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceTableComponent } from './performance-table.component';

describe('PerformanceTableComponent', () => {
  let component: PerformanceTableComponent;
  let fixture: ComponentFixture<PerformanceTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PerformanceTableComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformanceTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
