import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantSelectionButtonComponent } from './variant-selection-button.component';

describe('VariantSelectionButtonComponent', () => {
  let component: VariantSelectionButtonComponent;
  let fixture: ComponentFixture<VariantSelectionButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VariantSelectionButtonComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariantSelectionButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
