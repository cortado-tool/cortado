import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfixSelectionControllsComponent } from './infix-selection-controlls.component';

describe('InfixSelectionControllsComponent', () => {
  let component: InfixSelectionControllsComponent;
  let fixture: ComponentFixture<InfixSelectionControllsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InfixSelectionControllsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfixSelectionControllsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
