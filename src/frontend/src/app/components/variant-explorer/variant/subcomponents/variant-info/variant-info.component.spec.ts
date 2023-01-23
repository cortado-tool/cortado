import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantInfoComponent } from './variant-info.component';

describe('VariantInfoComponent', () => {
  let component: VariantInfoComponent;
  let fixture: ComponentFixture<VariantInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VariantInfoComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariantInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
