import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantQueryInfoComponent } from './variant-query-info.component';

describe('VariantQueryInfoComponent', () => {
  let component: VariantQueryInfoComponent;
  let fixture: ComponentFixture<VariantQueryInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VariantQueryInfoComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariantQueryInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
