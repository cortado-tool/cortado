/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResizeableTableHeaderComponent } from './resizeable-table-header.component';

describe('ResizeableTableHeaderComponent', () => {
  let component: ResizeableTableHeaderComponent;
  let fixture: ComponentFixture<ResizeableTableHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ResizeableTableHeaderComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResizeableTableHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
