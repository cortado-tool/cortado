import { TestBed } from '@angular/core/testing';

import { VariantService } from './variant.service';

describe('VariantService', () => {
  let service: VariantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VariantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
