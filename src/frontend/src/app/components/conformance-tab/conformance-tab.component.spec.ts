import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConformanceTabComponent } from './conformance-tab.component';

describe('ConformanceTabComponent', () => {
  let component: ConformanceTabComponent;
  let fixture: ComponentFixture<ConformanceTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConformanceTabComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConformanceTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
