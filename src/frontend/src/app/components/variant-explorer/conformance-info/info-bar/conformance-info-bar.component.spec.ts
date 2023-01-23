import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConformanceInfoBarComponent } from './conformance-info-bar.component';

describe('InfoBarComponent', () => {
  let component: ConformanceInfoBarComponent;
  let fixture: ComponentFixture<ConformanceInfoBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConformanceInfoBarComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConformanceInfoBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
