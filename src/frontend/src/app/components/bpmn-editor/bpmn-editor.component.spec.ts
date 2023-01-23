import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BpmnEditorComponent } from './bpmn-editor.component';

describe('BpmnEditorComponent', () => {
  let component: BpmnEditorComponent;
  let fixture: ComponentFixture<BpmnEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BpmnEditorComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BpmnEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
