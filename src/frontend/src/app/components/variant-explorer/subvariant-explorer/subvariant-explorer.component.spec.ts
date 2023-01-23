import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubvariantExplorerComponent } from './subvariant-explorer.component';

describe('SubvariantExplorerComponent', () => {
  let component: SubvariantExplorerComponent;
  let fixture: ComponentFixture<SubvariantExplorerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubvariantExplorerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubvariantExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
