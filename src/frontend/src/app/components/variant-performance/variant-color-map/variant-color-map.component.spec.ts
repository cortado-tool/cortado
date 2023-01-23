import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantColorMapComponent } from './variant-color-map.component';

describe('VariantColorMapComponent', () => {
  let component: VariantColorMapComponent;
  let fixture: ComponentFixture<VariantColorMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VariantColorMapComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariantColorMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
