import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityButtonAreaComponent } from './activity-button-area.component';

describe('ActivityButtonAreaComponent', () => {
  let component: ActivityButtonAreaComponent;
  let fixture: ComponentFixture<ActivityButtonAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActivityButtonAreaComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityButtonAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
