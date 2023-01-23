import { TestBed } from '@angular/core/testing';

import { ProcessTreeService } from './process-tree.service';

describe('ProcessTreeService', () => {
  let service: ProcessTreeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessTreeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
