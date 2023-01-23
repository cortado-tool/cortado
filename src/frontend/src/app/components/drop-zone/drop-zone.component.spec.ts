import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropZoneComponent } from './drop-zone.component';

describe('DropZoneComponent', () => {
  let component: DropZoneComponent;
  let fixture: ComponentFixture<DropZoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DropZoneComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
