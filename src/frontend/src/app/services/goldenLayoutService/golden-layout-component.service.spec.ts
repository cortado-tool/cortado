import { TestBed } from '@angular/core/testing';

import { GoldenLayoutComponentService } from './golden-layout-component.service';

describe('GoldenLayoutComponentService', () => {
  let service: GoldenLayoutComponentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoldenLayoutComponentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
