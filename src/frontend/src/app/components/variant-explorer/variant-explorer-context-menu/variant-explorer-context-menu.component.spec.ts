import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantExplorerContextMenuComponent } from './variant-explorer-context-menu.component';

describe('VariantExplorerContextMenuComponent', () => {
  let component: VariantExplorerContextMenuComponent;
  let fixture: ComponentFixture<VariantExplorerContextMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VariantExplorerContextMenuComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariantExplorerContextMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
