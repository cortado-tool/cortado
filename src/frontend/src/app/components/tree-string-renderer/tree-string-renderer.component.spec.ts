import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeStringRendererComponent } from './tree-string-renderer.component';

describe('TreeStringRendererComponent', () => {
  let component: TreeStringRendererComponent;
  let fixture: ComponentFixture<TreeStringRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TreeStringRendererComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeStringRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
