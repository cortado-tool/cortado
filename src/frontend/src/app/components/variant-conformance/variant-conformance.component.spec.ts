import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantConformanceComponent } from './variant-conformance.component';

describe('VariantConformanceComponent', () => {
  let component: VariantConformanceComponent;
  let fixture: ComponentFixture<VariantConformanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VariantConformanceComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariantConformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
