import { TestBed } from '@angular/core/testing';

import { ConformanceCheckingService } from './conformance-checking.service';

describe('ConformanceCheckingService', () => {
  let service: ConformanceCheckingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConformanceCheckingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
