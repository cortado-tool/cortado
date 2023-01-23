import { TestBed } from '@angular/core/testing';

import { ModelViewModeService } from './model-view-mode.service';

describe('ModelViewModeService', () => {
  let service: ModelViewModeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModelViewModeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
