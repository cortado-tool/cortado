import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantExplorerSidebarComponent } from './variant-explorer-sidebar.component';

describe('VariantExplorerSidebarComponent', () => {
  let component: VariantExplorerSidebarComponent;
  let fixture: ComponentFixture<VariantExplorerSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VariantExplorerSidebarComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariantExplorerSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
