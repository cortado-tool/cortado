import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelPerformanceComponent } from './performance.component';

describe('PerformanceComponent', () => {
  let component: ModelPerformanceComponent;
  let fixture: ComponentFixture<ModelPerformanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModelPerformanceComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelPerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
