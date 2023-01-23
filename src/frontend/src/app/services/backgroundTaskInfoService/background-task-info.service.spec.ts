import { TestBed } from '@angular/core/testing';

import { BackgroundTaskInfoService } from './background-task-info.service';

describe('BackgroundTaskInfoService', () => {
  let service: BackgroundTaskInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackgroundTaskInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
