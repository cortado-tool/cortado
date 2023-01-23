import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeSelectionPerformanceComponent } from './node-selection-performance.component';

describe('NodeSelectionPerformanceComponent', () => {
  let component: NodeSelectionPerformanceComponent;
  let fixture: ComponentFixture<NodeSelectionPerformanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NodeSelectionPerformanceComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeSelectionPerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
