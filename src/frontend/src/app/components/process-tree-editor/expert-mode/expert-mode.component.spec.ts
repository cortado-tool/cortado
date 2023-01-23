import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpertModeComponent } from './expert-mode.component';

describe('ExpertModeComponent', () => {
  let component: ExpertModeComponent;
  let fixture: ComponentFixture<ExpertModeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExpertModeComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpertModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
