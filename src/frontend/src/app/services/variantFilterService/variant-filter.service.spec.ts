import { TestBed } from '@angular/core/testing';

import { VariantFilterService } from './variant-filter.service';

describe('VariantFilterService', () => {
  let service: VariantFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VariantFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
