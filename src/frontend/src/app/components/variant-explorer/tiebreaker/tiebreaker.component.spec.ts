import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiebreakerComponent } from './tiebreaker.component';

describe('TiebreakerComponent', () => {
  let component: TiebreakerComponent;
  let fixture: ComponentFixture<TiebreakerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TiebreakerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TiebreakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
