import { TestBed } from '@angular/core/testing';

import { BackendInfoService } from './backend-info.service';

describe('BackendInfoService', () => {
  let service: BackendInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackendInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
