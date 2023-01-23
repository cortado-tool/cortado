import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreePerformanceColorMapComponent } from './tree-performance-color-map.component';

describe('TreePerformanceColorMapComponent', () => {
  let component: TreePerformanceColorMapComponent;
  let fixture: ComponentFixture<TreePerformanceColorMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TreePerformanceColorMapComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreePerformanceColorMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
