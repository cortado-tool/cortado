import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantPerformanceComponent } from './variant-performance.component';

describe('VariantPerformanceComponent', () => {
  let component: VariantPerformanceComponent;
  let fixture: ComponentFixture<VariantPerformanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VariantPerformanceComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariantPerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
