import { TestBed } from '@angular/core/testing';
import { ScrollDirection } from '../models/scroll-direction';
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

  it('should emit when scrolldirection changes', () => {
    let selectedScrollDirection: ScrollDirection | undefined;
    service.onChange.subscribe((scrollDirection) => {
      selectedScrollDirection = scrollDirection;
    });

    service.setScrollDirection(ScrollDirection.VERTICAL);
    expect(selectedScrollDirection).toEqual(ScrollDirection.VERTICAL);
  });
});
