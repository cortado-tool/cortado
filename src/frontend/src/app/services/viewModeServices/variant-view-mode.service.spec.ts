import { TestBed } from '@angular/core/testing';

import { VariantViewModeService } from './variant-view-mode.service';

describe('VariantViewModeService', () => {
  let service: VariantViewModeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VariantViewModeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
