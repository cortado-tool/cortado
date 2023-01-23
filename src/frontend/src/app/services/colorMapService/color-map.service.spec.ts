import { TestBed } from '@angular/core/testing';

import { ColorMapService } from './color-map.service';

describe('ColorMapService', () => {
  let service: ColorMapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColorMapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
