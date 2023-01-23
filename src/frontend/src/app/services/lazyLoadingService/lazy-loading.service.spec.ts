import { TestBed } from '@angular/core/testing';

import { LazyLoadingServiceService } from './lazy-loading.service';

describe('LazyLoadingServiceService', () => {
  let service: LazyLoadingServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LazyLoadingServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
