import { CanvasService } from '../../canvas-service/canvas-service';
import { ScrollDirectionService } from '../../scroll-direction-service/scroll-direction-service';
import { ModeService } from '../../mode-service/mode.service';
import { ViewerLayoutService } from '../../viewer-layout-service/viewer-layout-service';
import { ZoomStrategy } from '../zoom-strategy';
import { Rect, ViewingDirection } from '../../models';
import { DefaultGoToCanvasGroupStrategy } from './default-go-to-canvas-groups-strategy';
import { MockBreakpointObserver } from '../../../test/mock-breakpoint-observer';

describe('HorizontalGoToCanvasGroupStrategy ', () => {
  let canvasService: CanvasService;
  let modeService: ModeService;
  let viewerLayoutService: ViewerLayoutService;
  let zoomStrategy: ZoomStrategy;
  let goToCanvasGroupStrategy: DefaultGoToCanvasGroupStrategy;
  let viewer: any;
  let config: any;

  beforeEach(() => {
    viewer = createViewer();
    config = createConfig();
    canvasService = new CanvasService(new ScrollDirectionService());
    modeService = new ModeService();
    viewerLayoutService = new ViewerLayoutService(new MockBreakpointObserver());
    zoomStrategy = new ZoomStrategy(
      viewer,
      canvasService,
      modeService,
      viewerLayoutService,
    );
    goToCanvasGroupStrategy = new DefaultGoToCanvasGroupStrategy(
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

  it('should pan to when adjusting position', () => {
    goToCanvasGroupStrategy.adjustPosition();

    const expectedRect = { x: 0, y: 0 };
    expect(viewer.viewport.panTo).toHaveBeenCalledWith(expectedRect, false);
  });

  it('should pan to when centering current canvas', () => {
    const expectedRect = { x: 0, y: 0 };
    jest
      .spyOn(canvasService, 'getCanvasGroupRect')
      .mockReturnValue(new Rect(expectedRect));

    goToCanvasGroupStrategy.centerCurrentCanvas();

    expect(viewer.viewport.panTo).toHaveBeenCalledWith(expectedRect, false);
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
