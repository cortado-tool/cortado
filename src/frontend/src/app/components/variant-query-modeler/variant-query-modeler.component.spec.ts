import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VariantQueryModelerComponent } from './variant-query-modeler.component';

describe('VariantQueryModelerComponent', () => {
  let component: VariantQueryModelerComponent;
  let fixture: ComponentFixture<VariantQueryModelerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VariantQueryModelerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariantQueryModelerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
