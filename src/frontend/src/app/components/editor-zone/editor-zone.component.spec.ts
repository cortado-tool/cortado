/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EditorZoneComponent } from './editor-zone.component';

describe('EditorZoneComponent', () => {
  let component: EditorZoneComponent;
  let fixture: ComponentFixture<EditorZoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditorZoneComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
