import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantMinerPatternComponent } from './variant-miner-pattern.component';

describe('VariantMinerPatternComponent', () => {
  let component: VariantMinerPatternComponent;
  let fixture: ComponentFixture<VariantMinerPatternComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VariantMinerPatternComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariantMinerPatternComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
