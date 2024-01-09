import { TestBed } from '@angular/core/testing';

import { ScrollDirectionService } from './scroll-direction-service';

describe('ScrollDirectionServiceService', () => {
  let service: ScrollDirectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScrollDirectionService],
    });
    service = TestBed.inject(ScrollDirectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
