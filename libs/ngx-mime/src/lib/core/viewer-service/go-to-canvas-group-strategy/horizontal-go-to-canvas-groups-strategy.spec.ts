import { HorizontalGoToCanvasGroupStrategy } from './horizontal-go-to-canvas-groups-strategy';
import { CanvasService } from '../../canvas-service/canvas-service';
import { ScrollDirectionService } from '../../scroll-direction-service/scroll-direction-service';
import { ModeService } from '../../mode-service/mode.service';
import { ViewerLayoutService } from '../../viewer-layout-service/viewer-layout-service';
import { ZoomStrategy } from '../zoom-strategy';
import { Rect, ViewerMode, ViewingDirection } from '../../models';
import { MockBreakpointObserver } from '../../../test/mock-breakpoint-observer';

describe('HorizontalGoToCanvasGroupStrategy ', () => {
  let canvasService: CanvasService;
  let modeService: ModeService;
  let viewerLayoutService: ViewerLayoutService;
  let zoomStrategy: ZoomStrategy;
  let goToCanvasGroupStrategy: HorizontalGoToCanvasGroupStrategy;
  let viewer: any;
  let config: any;

  beforeEach(() => {
    viewer = createViewer();
    config = createConfig();
    modeService = new ModeService();
    viewerLayoutService = new ViewerLayoutService(new MockBreakpointObserver());
    canvasService = new CanvasService(
      viewerLayoutService,
      new ScrollDirectionService(),
    );
    zoomStrategy = new ZoomStrategy(
      viewer,
      canvasService,
      modeService,
      viewerLayoutService,
    );
    goToCanvasGroupStrategy = new HorizontalGoToCanvasGroupStrategy(
      viewer,
      zoomStrategy,
      canvasService,
      modeService,
      config,
      ViewingDirection.LTR,
    );

    jest.spyOn(viewer.viewport, 'getCenter').mockReturnValue(getCenterMock());
    jest
      .spyOn(viewer.viewport, 'getBounds')
      .mockReturnValue(getViewportBoundsMock());
    jest.spyOn(viewer.viewport, 'panTo');
  });

  describe('preserveZoomOnCanvasGroupChange', () => {
    describe('startOnTopOnCanvasGroupChange', () => {
      beforeEach(() => {
        config.preserveZoomOnCanvasGroupChange = true;
        config.startOnTopOnCanvasGroupChange = true;
        canvasService.currentCanvasGroupIndex = 10;
        modeService.mode = ViewerMode.PAGE_ZOOMED;
      });

      it('go to previous canvas group when zoomed in should pan to upper left on previous canvas', () => {
        jest.spyOn(canvasService, 'constrainToRange').mockReturnValue(9);
        jest.spyOn(canvasService, 'getCanvasGroupRect').mockReturnValue({
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          centerX: 50,
          centerY: 50,
        });
        goToCanvasGroupStrategy.goToCanvasGroup({
          canvasGroupIndex: 9,
          immediately: false,
        });

        expect(viewer.viewport.panTo).toHaveBeenCalledWith(
          { x: 50, y: -30 },
          false,
        );
      });

      it('go to next canvas group when zoomed in should pan to upper left on next canvas', () => {
        jest.spyOn(canvasService, 'constrainToRange').mockReturnValue(12);
        jest.spyOn(canvasService, 'getCanvasGroupRect').mockReturnValue({
          x: 100,
          y: 0,
          width: 100,
          height: 100,
          centerX: 50,
          centerY: 50,
        });

        goToCanvasGroupStrategy.goToCanvasGroup({
          canvasGroupIndex: 12,
          immediately: false,
        });

        expect(viewer.viewport.panTo).toHaveBeenCalledWith(
          { x: 150, y: -30 },
          false,
        );
      });
    });
  });

  describe('go to next and previous canvas group', () => {
    beforeEach(() => {
      jest
        .spyOn(canvasService, 'findClosestCanvasGroupIndex')
        .mockReturnValue(4);
      jest.spyOn(goToCanvasGroupStrategy, 'goToCanvasGroup').mockReturnValue();
    });

    it('should call goToCanvasGroup with the next canvas group index', () => {
      jest.spyOn(canvasService, 'isNextCanvasGroupValid').mockReturnValue(true);

      goToCanvasGroupStrategy.goToNextCanvasGroup(4);

      expect(goToCanvasGroupStrategy.goToCanvasGroup).toHaveBeenCalledWith(
        { canvasGroupIndex: 5, immediately: false },
        false,
      );
    });

    it('should call goToCanvasGroup with the previous canvas group index', () => {
      jest
        .spyOn(canvasService, 'isPreviousCanvasGroupValid')
        .mockReturnValue(true);

      goToCanvasGroupStrategy.goToPreviousCanvasGroup(4);

      expect(goToCanvasGroupStrategy.goToCanvasGroup).toHaveBeenCalledWith(
        { canvasGroupIndex: 3, immediately: false },
        false,
      );
    });
  });

  describe('goToCanvasGroup', () => {
    const canvasGroup = { canvasGroupIndex: 1, immediately: false };
    const canvasGroupRect: Rect = new Rect({ x: 50, y: 50 });

    beforeEach(() => {
      jest.spyOn(modeService, 'setViewerModeByZoomLevel');
      jest
        .spyOn(canvasService, 'getCanvasGroupRect')
        .mockReturnValue(canvasGroupRect);
    });

    it('should update ViewerMode if fitToWidth is enabled', () => {
      canvasService.toggleFitToWidth();

      goToCanvasGroupStrategy.goToCanvasGroup(canvasGroup);

      expect(modeService.setViewerModeByZoomLevel).toHaveBeenCalledTimes(1);
    });

    it('should update ViewerMode if fitToHeight is enabled', () => {
      canvasService.toggleFitToHeight();

      goToCanvasGroupStrategy.goToCanvasGroup(canvasGroup);

      expect(modeService.setViewerModeByZoomLevel).toHaveBeenCalledTimes(1);
    });

    describe('should call panToCenter', () => {
      it('when panToCenter flag is passed as true', () => {
        goToCanvasGroupStrategy.goToCanvasGroup(canvasGroup, true);

        expect(viewer.viewport.panTo).toHaveBeenLastCalledWith(
          getCenterMock(),
          false,
        );
      });

      it('when the viewer is not zoomed in', () => {
        goToCanvasGroupStrategy.goToCanvasGroup(canvasGroup);

        expect(viewer.viewport.panTo).toHaveBeenLastCalledWith(
          getCenterMock(),
          false,
        );
      });

      it('when the viewer is zoomed in and preserve zoom flag is false', () => {
        config.preserveZoomOnCanvasGroupChange = false;
        modeService.mode = ViewerMode.PAGE_ZOOMED;

        goToCanvasGroupStrategy.goToCanvasGroup(canvasGroup);

        expect(viewer.viewport.panTo).toHaveBeenLastCalledWith(
          getCenterMock(),
          false,
        );
      });
    });

    describe('should call panTo', () => {
      it('when the viewer is zoomed in and preserve zoom flag is true', () => {
        config.preserveZoomOnCanvasGroupChange = true;
        modeService.mode = ViewerMode.PAGE_ZOOMED;

        goToCanvasGroupStrategy.goToCanvasGroup(canvasGroup);

        expect(viewer.viewport.panTo).toHaveBeenCalledWith(
          { x: 100, y: 50 },
          false,
        );
      });
    });
  });

  function createViewer() {
    return {
      viewport: createViewport(),
      collectionTileMargin: 80,
    };
  }

  function createViewport() {
    return {
      getCenter: () => {},
      getBounds: () => {},
      panTo: (x: number, y: number) => {},
      getZoom: () => {},
    };
  }

  function createConfig() {
    return {};
  }

  function getCenterMock() {
    return { x: 50, y: 50 };
  }

  function getViewportBoundsMock() {
    return {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      centerX: 50,
      centerY: 50,
    };
  }
});
