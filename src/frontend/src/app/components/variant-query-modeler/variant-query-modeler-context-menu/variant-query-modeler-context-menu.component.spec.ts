import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantQueryModelerContextMenuComponent } from './variant-query-modeler-context-menu.component';

describe('VariantQueryModelerContextMenuComponent', () => {
  let component: VariantQueryModelerContextMenuComponent;
  let fixture: ComponentFixture<VariantQueryModelerContextMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VariantQueryModelerContextMenuComponent],
    });
    fixture = TestBed.createComponent(VariantQueryModelerContextMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
