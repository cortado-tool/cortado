/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { VariantQueryComponent } from './variant-query.component';

describe('VariantQueryComponent', () => {
  let component: VariantQueryComponent;
  let fixture: ComponentFixture<VariantQueryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VariantQueryComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VariantQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
