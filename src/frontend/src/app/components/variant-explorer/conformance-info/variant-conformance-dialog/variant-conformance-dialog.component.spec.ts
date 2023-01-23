import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantConformanceDialogComponent } from './variant-conformance-dialog.component';

describe('VariantConformanceDialogComponent', () => {
  let component: VariantConformanceDialogComponent;
  let fixture: ComponentFixture<VariantConformanceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VariantConformanceDialogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariantConformanceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
