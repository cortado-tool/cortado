import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoldenLayoutHostComponent } from './golden-layout-host.component';

describe('GoldenLayoutHostComponent', () => {
  let component: GoldenLayoutHostComponent;
  let fixture: ComponentFixture<GoldenLayoutHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GoldenLayoutHostComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GoldenLayoutHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
