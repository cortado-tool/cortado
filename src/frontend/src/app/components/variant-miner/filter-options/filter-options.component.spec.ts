import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterOptionsComponent } from './filter-options.component';

describe('FilterOptionsComponent', () => {
  let component: FilterOptionsComponent;
  let fixture: ComponentFixture<FilterOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilterOptionsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
