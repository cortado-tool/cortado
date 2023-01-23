/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ZoomFieldComponent } from './zoom-field.component';

describe('ZoomFieldComponent', () => {
  let component: ZoomFieldComponent;
  let fixture: ComponentFixture<ZoomFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ZoomFieldComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZoomFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
