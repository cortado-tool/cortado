import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessTreeEditorComponent } from './process-tree-editor.component';

describe('ProcessTreeEditorComponent', () => {
  let component: ProcessTreeEditorComponent;
  let fixture: ComponentFixture<ProcessTreeEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProcessTreeEditorComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessTreeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
