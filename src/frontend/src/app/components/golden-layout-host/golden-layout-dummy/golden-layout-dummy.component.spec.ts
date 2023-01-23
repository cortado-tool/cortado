import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoldenLayoutDummyComponent } from './golden-layout-dummy.component';

describe('GoldenLayoutDummyComponent', () => {
  let component: GoldenLayoutDummyComponent;
  let fixture: ComponentFixture<GoldenLayoutDummyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GoldenLayoutDummyComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GoldenLayoutDummyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
