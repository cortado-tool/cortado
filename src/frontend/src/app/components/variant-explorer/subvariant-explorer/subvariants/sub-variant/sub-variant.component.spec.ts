import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubVariantComponent } from './sub-variant.component';

describe('SubVariantComponent', () => {
  let component: SubVariantComponent;
  let fixture: ComponentFixture<SubVariantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubVariantComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubVariantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
