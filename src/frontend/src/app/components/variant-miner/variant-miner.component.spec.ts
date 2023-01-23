import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantMinerComponent } from './variant-miner.component';

describe('VariantMinerComponent', () => {
  let component: VariantMinerComponent;
  let fixture: ComponentFixture<VariantMinerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VariantMinerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariantMinerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
