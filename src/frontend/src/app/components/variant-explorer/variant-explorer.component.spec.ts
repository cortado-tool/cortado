import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantExplorerComponent } from './variant-explorer.component';

describe('VariantExplorerComponent', () => {
  let component: VariantExplorerComponent;
  let fixture: ComponentFixture<VariantExplorerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VariantExplorerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariantExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
