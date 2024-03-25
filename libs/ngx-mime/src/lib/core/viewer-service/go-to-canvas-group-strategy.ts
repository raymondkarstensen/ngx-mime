import { ScrollDirection } from '../models/scroll-direction';
import { CanvasService } from '../canvas-service/canvas-service';
import { MimeViewerConfig } from '../mime-viewer-config';
import { ModeService } from '../mode-service/mode.service';
import { Direction } from '../models/direction';
import { Point } from '../models/point';
import { Rect } from '../models/rect';
import { ViewerMode } from '../models/viewer-mode';
import { ViewerOptions } from '../models/viewer-options';
import { ViewingDirection } from '../models/viewing-direction';
import { CalculateNextCanvasGroupFactory } from './calculate-next-canvas-group-factory';
import { ZoomStrategy } from './zoom-strategy';
import { FitTo } from '../../core/models';

export interface CanvasGroup {
  canvasGroupIndex: number;
  direction?: Direction;
  immediately?: boolean;
}

export interface GoToCanvasGroupStrategy {
  goToCanvasGroup(canvasGroup: CanvasGroup): void;
  goToPreviousCanvasGroup(currentCanvasIndex: number): void;
  goToNextCanvasGroup(currentCanvasIndex: number): void;
  centerCurrentCanvas(): void;
  panToCenterVertically(immediately?: boolean): void;
  panToCenterHorizontally(immediately?: boolean): void;
}

export class HorizontalGoToCanvasGroupStrategy implements GoToCanvasGroupStrategy {
  constructor(
    private viewer: any,
    private zoomStrategy: ZoomStrategy,
    private canvasService: CanvasService,
    private modeService: ModeService,
    private config: MimeViewerConfig,
    private viewingDirection: ViewingDirection,
  ) {}

  goToCanvasGroup(canvasGroup: CanvasGroup) {
    const oldCanvasGroupIndex = this.canvasService.currentCanvasGroupIndex;
    this.canvasService.currentCanvasGroupIndex = this.canvasService.constrainToRange(canvasGroup.canvasGroupIndex);
    const newCanvasGroup = this.canvasService.getCanvasGroupRect(this.canvasService.currentCanvasGroupIndex);

    if (this.canvasService.getFitTo() === FitTo.WIDTH) {
      this.zoomStrategy.fitToWidth();
    } else if (this.canvasService.getFitTo() === FitTo.HEIGHT) {
      this.zoomStrategy.fitToHeight();
    } else {

      if (this.modeService.isPageZoomed() && this.config.preserveZoomOnCanvasGroupChange) {
        let x: number;

        if (oldCanvasGroupIndex > canvasGroup.canvasGroupIndex) {
          if (this.config.startOnTopOnCanvasGroupChange) {
            const canvasGroupIndexes = this.canvasService.getCanvasesPerCanvasGroup(canvasGroup.canvasGroupIndex);
            const previousCanvasIndex = canvasGroupIndexes[ canvasGroupIndexes.length - 1 ];
            const previousCanvasRect = this.canvasService.getCanvasRect(previousCanvasIndex);
            x = this.viewingDirection === ViewingDirection.LTR ? this.leftX(previousCanvasRect) : this.rightX(newCanvasGroup);
          } else {
            x = this.viewingDirection === ViewingDirection.LTR ? this.rightX(newCanvasGroup) : this.leftX(newCanvasGroup);
          }
        } else {
          x = this.viewingDirection === ViewingDirection.LTR ? this.leftX(newCanvasGroup) : this.rightX(newCanvasGroup);
        }

        const y =
          this.config.startOnTopOnCanvasGroupChange &&
          oldCanvasGroupIndex !== canvasGroup.canvasGroupIndex
            ? newCanvasGroup.y +
            this.getViewportBounds().height / 2 -
            this.viewer.collectionTileMargin
            : this.getViewportCenter().y;

        this.panTo(x, y, canvasGroup.immediately);
      } else if (this.modeService.isPageZoomed()) {
        const oldCanvasGroupCenter = this.canvasService.getCanvasGroupRect(oldCanvasGroupIndex);
        this.panToCenter(oldCanvasGroupCenter, canvasGroup.immediately);
        this.zoomStrategy.goToHomeZoom();
        setTimeout(() => {
          this.panToCenter(newCanvasGroup, canvasGroup.immediately);
          this.modeService.mode = ViewerMode.PAGE;
        }, ViewerOptions.transitions.OSDAnimationTime);
      } else {
        this.panToCenter(newCanvasGroup, canvasGroup.immediately);
      }
    }
  }

  public goToPreviousCanvasGroup(currentCanvasIndex: number): void {
    if (this.canvasService.currentCanvasGroupIndex > 0) {
      const viewportCenter = this.getViewportCenter();
      const currentCanvasGroupIndex =
        this.canvasService.findClosestCanvasGroupIndex(viewportCenter);

      const calculateNextCanvasGroupStrategy =
        CalculateNextCanvasGroupFactory.create(ViewerMode.NAVIGATOR);
      const newCanvasGroupIndex =
        calculateNextCanvasGroupStrategy.calculateNextCanvasGroup({
          direction: Direction.PREVIOUS,
          currentCanvasGroupIndex: currentCanvasGroupIndex,
          currentCanvasGroupCenter: currentCanvasIndex,
          viewingDirection: this.viewingDirection,
          scrollDirection: ScrollDirection.HORIZONTAL
        });
      this.goToCanvasGroup({
        canvasGroupIndex: newCanvasGroupIndex,
        immediately: false,
      });
    }
  }

  public goToNextCanvasGroup(currentCanvasIndex: number): void {
    if (
      this.canvasService.currentCanvasGroupIndex <
      this.canvasService.numberOfCanvasGroups
    ) {
      const viewportCenter = this.getViewportCenter();
      const currentCanvasGroupIndex =
        this.canvasService.findClosestCanvasGroupIndex(viewportCenter);

      const calculateNextCanvasGroupStrategy =
        CalculateNextCanvasGroupFactory.create(ViewerMode.NAVIGATOR);
      const newCanvasGroupIndex =
        calculateNextCanvasGroupStrategy.calculateNextCanvasGroup({
          direction: Direction.NEXT,
          currentCanvasGroupIndex: currentCanvasGroupIndex,
          currentCanvasGroupCenter: currentCanvasIndex,
          viewingDirection: this.viewingDirection,
          scrollDirection: ScrollDirection.HORIZONTAL
        });
      this.goToCanvasGroup({
        canvasGroupIndex: newCanvasGroupIndex,
        immediately: false,
      });
    }
  }

  public centerCurrentCanvas(): void {
    const currentCanvasGroupIndex = this.canvasService.currentCanvasGroupIndex;
    const currentCanvasGroupCenter = this.canvasService.getCanvasGroupRect(
      currentCanvasGroupIndex
    );
    this.panToCenter(currentCanvasGroupCenter, false);
  }

  private leftX(canvas: Rect): number {
    return canvas.x + this.getViewportBounds().width / 2;
  }

  private rightX(canvas: Rect): number {
    return canvas.x + canvas.width - this.getViewportBounds().width / 2;
  }

  private panToCenter(canvasGroup: Rect, immediately = false): void {
    this.panTo(canvasGroup.centerX, canvasGroup.centerY, immediately);
  }

  panToCenterVertically(immediately = false): void {
    this.panTo(this.getViewportCenter().x, 0, immediately);
  }

  panToCenterHorizontally(immediately = false): void {
    this.panTo(0, this.getViewportCenter().y, immediately);
  }

  private getCurrentCanvasGroup(): Rect {
    const currentCanvasGroupIndex = this.canvasService.currentCanvasGroupIndex;
    return this.canvasService.getCanvasGroupRect(currentCanvasGroupIndex);
  }

  private panTo(x: number, y: number, immediately = false): void {
    this.viewer.viewport.panTo(
      {
        x: x,
        y: y,
      },
      immediately
    );
  }

  private getViewportCenter(): Point {
    return this.viewer.viewport.getCenter(true);
  }

  private getViewportBounds(): Rect {
    return this.viewer.viewport.getBounds();
  }
}

export class VerticalGoToCanvasGroupStrategy implements GoToCanvasGroupStrategy {
  constructor(
    private viewer: any,
    private zoomStrategy: ZoomStrategy,
    private canvasService: CanvasService,
    private modeService: ModeService,
    private config: MimeViewerConfig,
    private viewingDirection: ViewingDirection,
  ) {}

  goToCanvasGroup(canvasGroup: CanvasGroup) {
    const oldCanvasGroupIndex = this.canvasService.currentCanvasGroupIndex;
    this.canvasService.currentCanvasGroupIndex =
      this.canvasService.constrainToRange(canvasGroup.canvasGroupIndex);
    const newCanvasGroup = this.canvasService.getCanvasGroupRect(
      this.canvasService.currentCanvasGroupIndex
    );

    if (this.canvasService.getFitTo() === FitTo.WIDTH) {
      this.zoomStrategy.fitToWidth();
    } else if (this.canvasService.getFitTo() === FitTo.HEIGHT) {
      this.zoomStrategy.fitToHeight();
    } else {

      if (
        this.modeService.isPageZoomed() &&
        this.config.preserveZoomOnCanvasGroupChange
      ) {
        let y: number; // Change x to y

        if (oldCanvasGroupIndex > canvasGroup.canvasGroupIndex) {
          if (this.config.startOnTopOnCanvasGroupChange) {
            const canvasGroupIndexes =
              this.canvasService.getCanvasesPerCanvasGroup(
                canvasGroup.canvasGroupIndex
              );
            const previousCanvasIndex =
              canvasGroupIndexes[ canvasGroupIndexes.length - 1 ];
            const previousCanvasRect =
              this.canvasService.getCanvasRect(previousCanvasIndex);
            y =
              this.viewingDirection === ViewingDirection.LTR
                ? this.topY(previousCanvasRect)
                : this.bottomY(newCanvasGroup);
          } else {
            y =
              this.viewingDirection === ViewingDirection.LTR
                ? this.bottomY(newCanvasGroup)
                : this.topY(newCanvasGroup);
          }
        } else {
          y =
            this.viewingDirection === ViewingDirection.LTR
              ? this.topY(newCanvasGroup)
              : this.bottomY(newCanvasGroup);
        }

        const x =
          this.config.startOnTopOnCanvasGroupChange &&
          oldCanvasGroupIndex !== canvasGroup.canvasGroupIndex
            ? newCanvasGroup.x +
            this.getViewportBounds().width / 2 -
            this.viewer.collectionTileMargin
            : this.getViewportCenter().x;

        this.panTo(x, y, canvasGroup.immediately);
      } else if (this.modeService.isPageZoomed()) {
        const oldCanvasGroupCenter =
          this.canvasService.getCanvasGroupRect(oldCanvasGroupIndex);
        this.panToCenter(oldCanvasGroupCenter, canvasGroup.immediately);
        this.zoomStrategy.goToHomeZoom();
        setTimeout(() => {
          this.panToCenter(newCanvasGroup, canvasGroup.immediately);
          this.modeService.mode = ViewerMode.PAGE;
        }, ViewerOptions.transitions.OSDAnimationTime);
      } else {
        this.panToCenter(newCanvasGroup, canvasGroup.immediately);
      }
    }
  }

  public goToPreviousCanvasGroup(currentCanvasIndex: number): void {
    if (this.canvasService.currentCanvasGroupIndex > 0) {
      const viewportCenter = this.getViewportCenter();
      const currentCanvasGroupIndex =
        this.canvasService.findClosestCanvasGroupIndex(viewportCenter);

      const calculateNextCanvasGroupStrategy =
        CalculateNextCanvasGroupFactory.create(ViewerMode.NAVIGATOR);
      const newCanvasGroupIndex =
        calculateNextCanvasGroupStrategy.calculateNextCanvasGroup({
          direction: Direction.PREVIOUS,
          currentCanvasGroupIndex: currentCanvasGroupIndex,
          currentCanvasGroupCenter: currentCanvasIndex,
          viewingDirection: this.viewingDirection,
          scrollDirection: ScrollDirection.VERTICAL,
        });
      this.goToCanvasGroup({
        canvasGroupIndex: newCanvasGroupIndex,
        immediately: false,
      });
    }
  }

  public goToNextCanvasGroup(currentCanvasIndex: number): void {
    if (
      this.canvasService.currentCanvasGroupIndex <
      this.canvasService.numberOfCanvasGroups
    ) {
      const viewportCenter = this.getViewportCenter();
      const currentCanvasGroupIndex =
        this.canvasService.findClosestCanvasGroupIndex(viewportCenter);

      const calculateNextCanvasGroupStrategy =
        CalculateNextCanvasGroupFactory.create(ViewerMode.NAVIGATOR);
      const newCanvasGroupIndex =
        calculateNextCanvasGroupStrategy.calculateNextCanvasGroup({
          direction: Direction.NEXT,
          currentCanvasGroupIndex: currentCanvasGroupIndex,
          currentCanvasGroupCenter: currentCanvasIndex,
          viewingDirection: this.viewingDirection,
          scrollDirection: ScrollDirection.VERTICAL,
        });
      this.goToCanvasGroup({
        canvasGroupIndex: newCanvasGroupIndex,
        immediately: false,
      });
    }
  }

  public centerCurrentCanvas(): void {
    const currentCanvasGroupIndex = this.canvasService.currentCanvasGroupIndex;
    const currentCanvasGroupCenter = this.canvasService.getCanvasGroupRect(
      currentCanvasGroupIndex
    );
    this.panToCenter(currentCanvasGroupCenter, false);
  }

  private topY(canvas: Rect): number {
    return canvas.y + (this.getViewportBounds().height / 2);
  }

  private bottomY(canvas: Rect): number {
    return canvas.y + canvas.height - this.getViewportBounds().height / 2;
  }

  private panToCenter(canvasGroup: Rect, immediately = false): void {
    this.panTo(canvasGroup.centerX, canvasGroup.centerY, immediately);
  }

  panToCenterVertically(immediately = false): void {
    this.panTo(this.getViewportCenter().x, 0, immediately);
  }

  panToCenterHorizontally(immediately = false): void {
    this.panTo(0, this.getViewportCenter().y, immediately);
  }

  private getCurrentCanvasGroup(): Rect {
    const currentCanvasGroupIndex = this.canvasService.currentCanvasGroupIndex;
    return this.canvasService.getCanvasGroupRect(currentCanvasGroupIndex);
  }

  private panTo(x: number, y: number, immediately = false): void {
    this.viewer.viewport.panTo(
      {
        x: x,
        y: y,
      },
      immediately
    );
  }

  private getViewportCenter(): Point {
    return this.viewer.viewport.getCenter(true);
  }

  private getViewportBounds(): Rect {
    return this.viewer.viewport.getBounds(true);
  }
}
