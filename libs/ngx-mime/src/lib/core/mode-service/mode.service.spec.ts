import { TestBed } from '@angular/core/testing';
import { ModeChanges, ViewerMode } from '../models';
import { ModeService } from './mode.service';

describe('ModeService', () => {
  let service: ModeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ModeService],
    });
    service = TestBed.inject(ModeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit when mode changes', () => {
    let selectedMode: ViewerMode | undefined;
    service.onChange.subscribe(
      (mode: ModeChanges) => (selectedMode = mode.currentValue)
    );

    service.mode = ViewerMode.DASHBOARD;
    expect(selectedMode).toEqual(ViewerMode.DASHBOARD);
  });

  it('should change mode when toggled', () => {
    service.mode = ViewerMode.DASHBOARD.valueOf();
    service.toggleMode();
    expect(service.mode).toEqual(ViewerMode.PAGE);
    service.toggleMode();
    expect(service.mode).toEqual(ViewerMode.DASHBOARD);
  });

  it('should change mode to DASHBOARD when toggled in PAGE_ZOOMED', () => {
    service.mode = ViewerMode.PAGE_ZOOMED.valueOf();
    service.toggleMode();
    expect(service.mode).toEqual(ViewerMode.DASHBOARD);
  });

  it('should emit when mode is toggled', () => {
    let selectedMode: ViewerMode | undefined;
    service.onChange.subscribe(
      (mode: ModeChanges) => (selectedMode = mode.currentValue)
    );
    service.mode = ViewerMode.DASHBOARD;
    service.toggleMode();
    expect(selectedMode).toEqual(ViewerMode.PAGE);
  });

  describe('setViewerModeByZoomLevel', () => {
    it('should set mode to PAGE_ZOOMED when zoom level is larger than home zoom level', () => {
      const zoomLevel = 1;
      const homeZoomLevel = 0;

      service.setViewerModeByZoomLevel(zoomLevel, homeZoomLevel);

      expect(service.mode).toEqual(ViewerMode.PAGE_ZOOMED);
    });

    it('should set mode to PAGE when home zoom level is larger than zoom level', () => {
      const zoomLevel = 0;
      const homeZoomLevel = 1;

      service.setViewerModeByZoomLevel(zoomLevel, homeZoomLevel);

      expect(service.mode).toEqual(ViewerMode.PAGE);
    });
  });
});
