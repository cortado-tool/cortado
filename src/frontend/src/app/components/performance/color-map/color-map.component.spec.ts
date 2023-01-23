import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorMapComponent } from './color-map.component';

describe('ColorMapComponent', () => {
  let component: ColorMapComponent;
  let fixture: ComponentFixture<ColorMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ColorMapComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
