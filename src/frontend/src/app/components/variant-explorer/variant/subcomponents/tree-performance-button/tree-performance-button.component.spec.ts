import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreePerformanceButtonComponent } from './tree-performance-button.component';

describe('TreePerformanceButtonComponent', () => {
  let component: TreePerformanceButtonComponent;
  let fixture: ComponentFixture<TreePerformanceButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TreePerformanceButtonComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreePerformanceButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
