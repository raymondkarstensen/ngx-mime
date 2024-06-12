import * as d3 from 'd3';
import * as OpenSeadragon from 'openseadragon';
import { Rect } from 'openseadragon';

import { CanvasService } from '../canvas-service/canvas-service';
import { ModeService } from '../mode-service/mode.service';
import {
  Dimensions,
  Point,
  ViewerLayout,
  ViewerMode,
  ViewerOptions,
} from '../models';
import { Utils } from '../utils';
import { ViewerLayoutService } from '../viewer-layout-service/viewer-layout-service';
import { ZoomUtils } from './zoom-utils';

export interface Strategy {
  setMinZoom(mode: ViewerMode): void;
  getMaxZoom(): number;
  getZoom(): number;
  getHomeZoomLevel(mode: ViewerMode): number;
  goToHomeZoom(): void;
  zoomTo(level: number, position?: Point): void;
  zoomIn(zoomFactor?: number, position?: Point): void;
  zoomOut(zoomFactor?: number, position?: Point): void;
}

export class ZoomStrategy {
  constructor(
    protected viewer: any,
    protected canvasService: CanvasService,
    protected modeService: ModeService,
    protected viewerLayoutService: ViewerLayoutService,
  ) {}

  setMinZoom(mode: ViewerMode): void {
    this.viewer.viewport.minZoomLevel = this.getHomeZoomLevel(mode);
  }

  getMaxZoom(): number {
    return Utils.shortenDecimals(this.viewer.viewport.getMaxZoom(), 5);
  }

  getZoom(): number {
    return Utils.shortenDecimals(this.viewer.viewport.getZoom(true), 5);
  }

  goToHomeZoom(): void {
    this.zoomTo(this.getHomeZoomLevel(this.modeService.mode));
    if (this.modeService.isPageZoomed()) {
      this.modeService.mode = ViewerMode.PAGE;
    }
  }

  zoomTo(level: number, position?: Point): void {
    if (level !== 0) {
      this.viewer.viewport.zoomTo(level, position);
    }
  }

  getHomeZoomLevel(mode: ViewerMode): number {
    if (!this.viewer || !this.canvasService || !this.viewer.container) {
      return 1;
    }

    let currentCanvasHeight: number;
    let currentCanvasWidth: number;
    let viewportBounds: any;

    const currentCanvasGroupRect =
      this.canvasService.getCurrentCanvasGroupRect();
    currentCanvasHeight = currentCanvasGroupRect.height;
    currentCanvasWidth = currentCanvasGroupRect.width;
    viewportBounds =
      mode === ViewerMode.DASHBOARD
        ? this.getDashboardViewportBounds()
        : this.viewer.viewport.getBounds();

    return this.getFittedZoomLevel(
      viewportBounds,
      currentCanvasHeight,
      currentCanvasWidth,
    );
  }

  zoomIn(zoomFactor?: number, position?: Point): void {
    if (!zoomFactor) {
      zoomFactor = ViewerOptions.zoom.zoomFactor;
    }

    if (position) {
      position = this.viewer.viewport.pointFromPixel(position);
      if (position) {
        position = ZoomUtils.constrainPositionToCanvasGroup(
          position,
          this.canvasService.getCurrentCanvasGroupRect(),
        );
      }
    }

    if (this.modeService.mode !== ViewerMode.PAGE_ZOOMED) {
      this.modeService.mode = ViewerMode.PAGE_ZOOMED;
    }

    this.zoomBy(zoomFactor, position);
  }

  zoomOut(zoomFactor?: number, position?: Point): void {
    if (!zoomFactor) {
      zoomFactor = Math.pow(ViewerOptions.zoom.zoomFactor, -1);
    }

    if (position) {
      position = this.viewer.viewport.pointFromPixel(position);
      if (position) {
        position = ZoomUtils.constrainPositionToCanvasGroup(
          position,
          this.canvasService.getCurrentCanvasGroupRect(),
        );
      }
    }

    if (
      this.isViewportLargerThanCanvasGroup() &&
      this.modeService.isPageZoomed()
    ) {
      this.modeService.mode = ViewerMode.PAGE;
    } else {
      this.zoomBy(zoomFactor, position);
    }
  }

  getFitToHeightZoomLevel(
    viewportBoundsHeight: number,
    canvasGroupHeight: number,
  ): number {
    const ratio: number = viewportBoundsHeight / canvasGroupHeight;
    return Utils.shortenDecimals(ratio * this.viewer.viewport.getZoom(), 5);
  }

  getFitToWidthZoomLevel(
    viewportBoundsWidth: number,
    canvasGroupWidth: number,
  ): number {
    const ratio: number = viewportBoundsWidth / canvasGroupWidth;
    return Utils.shortenDecimals(ratio * this.viewer.viewport.getZoom(), 5);
  }

  fitToHeight(): void {
    const viewportBounds = this.viewer.viewport.getBounds();
    const canvasGroupRect = this.canvasService.getCurrentCanvasGroupRect();
    const zoomLevel = this.getFitToHeightZoomLevel(
      viewportBounds.height,
      canvasGroupRect.height,
    );
    this.updateViewerMode(zoomLevel);
    this.setMinZoom(this.modeService.mode);
    this.zoomTo(zoomLevel);
  }

  fitToWidth(): void {
    const viewportBounds: Rect = this.viewer.viewport.getBounds();
    const canvasGroupRect = this.canvasService.getCurrentCanvasGroupRect();
    const zoomLevel = this.getFitToWidthZoomLevel(
      viewportBounds.width,
      canvasGroupRect.width,
    );
    this.updateViewerMode(zoomLevel);
    this.setMinZoom(this.modeService.mode);
    this.zoomTo(zoomLevel);
  }

  private getDashboardViewportBounds(): any {
    const homeZoomFactor = this.getHomeZoomFactor();
    const maxViewportDimensions = new Dimensions(
      d3
        .select(this.viewer.container.parentNode.parentNode)
        .node()
        .getBoundingClientRect(),
    );
    const viewportHeight =
      maxViewportDimensions.height -
      ViewerOptions.padding.header -
      ViewerOptions.padding.footer;
    const viewportWidth = maxViewportDimensions.width * homeZoomFactor;

    const viewportSizeInViewportCoordinates =
      this.viewer.viewport.deltaPointsFromPixels(
        new OpenSeadragon.Point(viewportWidth, viewportHeight),
      );

    return new OpenSeadragon.Rect(
      0,
      0,
      viewportSizeInViewportCoordinates.x,
      viewportSizeInViewportCoordinates.y,
    );
  }

  private getFittedZoomLevel(
    viewportBounds: any,
    canvasGroupHeight: number,
    canvasGroupWidth: number,
  ) {
    const resizeRatio: number = viewportBounds.height / canvasGroupHeight;

    if (resizeRatio * canvasGroupWidth <= viewportBounds.width) {
      return this.getFitToHeightZoomLevel(
        viewportBounds.height,
        canvasGroupHeight,
      );
    } else {
      // Canvas group at full height is wider than viewport.  Return fit by width instead.
      return this.getFitToWidthZoomLevel(
        viewportBounds.width,
        canvasGroupWidth,
      );
    }
  }

  private updateViewerMode(zoomLevel: number): void {
    const homeZoomLevel = this.getHomeZoomLevel(this.modeService.mode);
    this.modeService.setViewerModeByZoomLevel(zoomLevel, homeZoomLevel);
  }

  private zoomBy(zoomFactor: number, position?: Point): void {
    const currentZoom = this.viewer.viewport.getZoom(false);
    zoomFactor = ZoomUtils.constraintZoomFactor(
      zoomFactor,
      currentZoom,
      this.getMaxZoom(),
    );
    this.viewer.viewport.zoomBy(zoomFactor, position);
  }

  private isViewportLargerThanCanvasGroup(): boolean {
    const canvasGroupRec = this.canvasService.getCurrentCanvasGroupRect();
    const viewportBounds = this.viewer.viewport.getBounds();
    const pbWidth = Math.round(canvasGroupRec.width);
    const pbHeight = Math.round(canvasGroupRec.height);
    const vpWidth = Math.round(viewportBounds.width);
    const vpHeight = Math.round(viewportBounds.height);
    return vpHeight >= pbHeight || vpWidth >= pbWidth;
  }

  private getHomeZoomFactor() {
    return this.modeService.mode === ViewerMode.DASHBOARD
      ? this.getDashboardZoomHomeFactor()
      : 1;
  }

  private getDashboardZoomHomeFactor() {
    return this.viewerLayoutService.layout === ViewerLayout.ONE_PAGE
      ? 0.85
      : 0.66;
  }
}

export class DefaultZoomStrategy extends ZoomStrategy implements Strategy {
  constructor(
    viewer: any,
    canvasService: CanvasService,
    modeService: ModeService,
    viewerLayoutService: ViewerLayoutService,
  ) {
    super(viewer, canvasService, modeService, viewerLayoutService);
  }
}
