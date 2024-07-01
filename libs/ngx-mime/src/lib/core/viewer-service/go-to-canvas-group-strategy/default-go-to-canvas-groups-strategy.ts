import { ZoomStrategy } from '../zoom-strategy';
import { CanvasService } from '../../canvas-service/canvas-service';
import { ModeService } from '../../mode-service/mode.service';
import { MimeViewerConfig } from '../../mime-viewer-config';
import {
  CanvasGroup,
  Direction,
  Point,
  Rect,
  ScrollDirection,
  ViewerMode,
  ViewingDirection,
} from '../../models';
import { CalculateNextCanvasGroupFactory } from '../calculate-next-canvas-group-factory';
import { GoToCanvasGroupStrategy } from './go-to-canvas-group-strategy';

export class DefaultGoToCanvasGroupStrategy implements GoToCanvasGroupStrategy {
  private _previousCanvasGroupIndex = 0;
  constructor(
    protected viewer: any,
    protected zoomStrategy: ZoomStrategy,
    protected canvasService: CanvasService,
    protected modeService: ModeService,
    protected config: MimeViewerConfig,
    protected viewingDirection: ViewingDirection,
  ) {}

  set previousCanvasGroupIndex(previousCanvasGroupIndex: number) {
    this._previousCanvasGroupIndex = previousCanvasGroupIndex;
  }

  get previousCanvasGroupIndex(): number {
    return this._previousCanvasGroupIndex;
  }

  adjustPosition(): void {
    const rect = this.getRect(
      this.previousCanvasGroupIndex,
      this.canvasService.currentCanvasGroupIndex,
    );
    this.panTo(rect.x, rect.y, false);
  }

  goToCanvasGroup(canvasGroup: CanvasGroup): void {}

  goToPreviousCanvasGroup(currentCanvasIndex: number): void {}

  goToNextCanvasGroup(currentCanvasIndex: number): void {}

  centerCurrentCanvas(): void {
    const currentCanvasGroupIndex = this.canvasService.currentCanvasGroupIndex;
    const currentCanvasGroupCenter = this.canvasService.getCanvasGroupRect(
      currentCanvasGroupIndex,
    );
    this.panToCenter(currentCanvasGroupCenter, false);
  }

  protected updateCurrentCanvasGroupIndex(canvasGroupIndex: number) {
    this.canvasService.currentCanvasGroupIndex =
      this.canvasService.constrainToRange(canvasGroupIndex);
  }

  protected shouldPanToCenter(): boolean {
    return (
      !this.modeService.isPageZoomed() ||
      (this.modeService.isPageZoomed() &&
        !this.config.preserveZoomOnCanvasGroupChange)
    );
  }

  protected updateViewerMode(canvasGroup: CanvasGroup): void {
    this.modeService.setViewerModeByZoomLevel(
      this.getFittedZoomLevel(
        this.canvasService.getCanvasGroupRect(canvasGroup.canvasGroupIndex),
      ),
      this.zoomStrategy.getHomeZoomLevel(this.modeService.mode),
    );
  }

  protected panTo(x: number, y: number, immediately = false): void {
    this.viewer.viewport.panTo({ x, y }, immediately);
  }

  protected getViewportCenter(): Point {
    return this.viewer.viewport.getCenter();
  }

  protected getViewportBounds(): Rect {
    return this.viewer.viewport.getBounds();
  }

  protected panToCenter(canvasGroupRect: Rect, immediately = false): void {
    this.panTo(canvasGroupRect.centerX, canvasGroupRect.centerY, immediately);
  }

  protected isNewCanvasGroup(previous: number, current: number): boolean {
    return previous !== current;
  }

  protected isNavigatingToPreviousCanvas(
    previous: number,
    current: number,
  ): boolean {
    return previous > current;
  }

  protected getX(
    previousCanvasGroupIndex: number,
    nextCanvasGroupIndex: number,
  ): number {
    return 0;
  }

  protected getY(
    previousCanvasGroupIndex: number,
    nextCanvasGroupIndex: number,
  ): number {
    return 0;
  }

  protected getRect(
    previousCanvasGroupIndex: number,
    nextCanvasGroupIndex: number,
  ): Rect {
    return new Rect({
      x: this.getX(previousCanvasGroupIndex, nextCanvasGroupIndex),
      y: this.getY(previousCanvasGroupIndex, nextCanvasGroupIndex),
    });
  }

  private getFittedZoomLevel(canvasGroup: Rect): number {
    const viewportBounds: Rect = this.getViewportBounds();
    let zoomLevel = this.viewer.viewport.getZoom();
    if (this.canvasService.isFitToWidthEnabled()) {
      zoomLevel = this.zoomStrategy.getFitToWidthZoomLevel(
        viewportBounds.width,
        canvasGroup.width,
      );
    } else if (this.canvasService.isFitToHeightEnabled()) {
      zoomLevel = this.zoomStrategy.getFitToHeightZoomLevel(
        viewportBounds.height,
        canvasGroup.height,
      );
    }
    return zoomLevel;
  }

  protected getNextCanvasGroupIndex(
    currentCanvasIndex: number,
    direction: Direction,
    scrollDirection: ScrollDirection,
  ): number {
    return CalculateNextCanvasGroupFactory.create(
      ViewerMode.NAVIGATOR,
    ).calculateNextCanvasGroup({
      direction,
      currentCanvasGroupIndex: this.canvasService.findClosestCanvasGroupIndex(
        this.getViewportCenter(),
      ),
      currentCanvasGroupCenter: currentCanvasIndex,
      viewingDirection: this.viewingDirection,
      scrollDirection,
    });
  }
}
