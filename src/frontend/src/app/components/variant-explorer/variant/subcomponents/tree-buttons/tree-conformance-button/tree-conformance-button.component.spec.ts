import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeConformanceButtonComponent } from './tree-conformance-button.component';

describe('TreeConformanceButtonComponent', () => {
  let component: TreeConformanceButtonComponent;
  let fixture: ComponentFixture<TreeConformanceButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TreeConformanceButtonComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeConformanceButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
