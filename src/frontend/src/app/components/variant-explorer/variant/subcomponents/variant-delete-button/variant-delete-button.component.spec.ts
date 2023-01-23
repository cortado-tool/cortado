import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantDeleteButtonComponent } from './variant-delete-button.component';

describe('VariantDeleteButtonComponent', () => {
  let component: VariantDeleteButtonComponent;
  let fixture: ComponentFixture<VariantDeleteButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VariantDeleteButtonComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariantDeleteButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
