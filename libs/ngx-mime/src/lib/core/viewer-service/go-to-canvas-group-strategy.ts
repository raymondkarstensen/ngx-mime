import { ScrollDirection } from '../models/scroll-direction';
import { CanvasService } from '../canvas-service/canvas-service';
import { MimeViewerConfig } from '../mime-viewer-config';
import { ModeService } from '../mode-service/mode.service';
import { Direction } from '../models/direction';
import { Point } from '../models/point';
import { Rect } from '../models/rect';
import { ViewerMode } from '../models/viewer-mode';
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

export class HorizontalGoToCanvasGroupStrategy
  implements GoToCanvasGroupStrategy
{
  constructor(
    private viewer: any,
    private canvasService: CanvasService,
    private modeService: ModeService,
    private config: MimeViewerConfig,
    private viewingDirection: ViewingDirection,
  ) {}

  private getPreviousCanvasGroup(canvasGroup: CanvasGroup): Rect {
    const canvasGroupIndexes = this.canvasService.getCanvasesPerCanvasGroup(
      canvasGroup.canvasGroupIndex,
    );
    const previousCanvasIndex =
      canvasGroupIndexes[canvasGroupIndexes.length - 1];
    return this.canvasService.getCanvasRect(previousCanvasIndex);
  }

  private updateCurrentCanvasGroupIndex(canvasGroupIndex: number) {
    this.canvasService.currentCanvasGroupIndex =
      this.canvasService.constrainToRange(canvasGroupIndex);
  }

  private shouldPanToCenter(): boolean {
    return (
      (!this.modeService.isPageZoomed() &&
        this.canvasService.getFitTo() === FitTo.NONE) || // If the viewer is in PAGE mode and is NOT fitted to width or height
      (this.modeService.isPageZoomed() &&
        !this.config.preserveZoomOnCanvasGroupChange)
    ); // If the viewer is ZOOMED and zoom should be preservedd
  }

  goToCanvasGroup(canvasGroup: CanvasGroup) {
    const currentCanvasGroupIndex = this.canvasService.currentCanvasGroupIndex;
    this.updateCurrentCanvasGroupIndex(canvasGroup.canvasGroupIndex);
    const newCanvasGroup = this.canvasService.getCanvasGroupRect(
      this.canvasService.currentCanvasGroupIndex,
    );
    const isNavigatingToPreviousCanvas =
      currentCanvasGroupIndex > canvasGroup.canvasGroupIndex;
    let y = 0;
    let x: number;

    if (this.shouldPanToCenter()) {
      this.panToCenter(newCanvasGroup, canvasGroup.immediately);
    } else {
      if (
        this.modeService.isPageZoomed() &&
        this.config.preserveZoomOnCanvasGroupChange
      ) {
        y =
          currentCanvasGroupIndex !== canvasGroup.canvasGroupIndex
            ? newCanvasGroup.y +
              this.getViewportBounds().height / 2 -
              this.viewer.collectionTileMargin
            : this.getViewportCenter().y;
      }

      if (isNavigatingToPreviousCanvas) {
        if (this.config.startOnTopOnCanvasGroupChange) {
          const previousCanvasGroup = this.getPreviousCanvasGroup(canvasGroup);
          x =
            this.viewingDirection === ViewingDirection.LTR
              ? this.leftX(previousCanvasGroup)
              : this.rightX(newCanvasGroup);
        } else {
          x =
            this.viewingDirection === ViewingDirection.LTR
              ? this.rightX(newCanvasGroup)
              : this.leftX(newCanvasGroup);
        }
      } else {
        x =
          this.viewingDirection === ViewingDirection.LTR
            ? this.leftX(newCanvasGroup)
            : this.rightX(newCanvasGroup);
      }

      this.panTo(x, y, canvasGroup.immediately);
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
          scrollDirection: ScrollDirection.HORIZONTAL,
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
          scrollDirection: ScrollDirection.HORIZONTAL,
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
      currentCanvasGroupIndex,
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
    const x = this.getViewportCenter().x;
    const y = 0;
    this.panTo(x, y, immediately);
  }

  panToCenterHorizontally(immediately = false): void {
    const x = 0;
    const y = this.getViewportCenter().y;
    this.panTo(x, y, immediately);
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
      immediately,
    );
  }

  private getViewportCenter(): Point {
    return this.viewer.viewport.getCenter();
  }

  private getViewportBounds(): Rect {
    return this.viewer.viewport.getBounds();
  }
}

export class VerticalGoToCanvasGroupStrategy
  implements GoToCanvasGroupStrategy
{
  constructor(
    private viewer: any,
    private canvasService: CanvasService,
    private modeService: ModeService,
    private config: MimeViewerConfig,
    private viewingDirection: ViewingDirection,
  ) {}

  private getPreviousCanvasGroup(canvasGroup: CanvasGroup): Rect {
    const canvasGroupIndexes = this.canvasService.getCanvasesPerCanvasGroup(
      canvasGroup.canvasGroupIndex,
    );
    const previousCanvasIndex =
      canvasGroupIndexes[canvasGroupIndexes.length - 1];
    return this.canvasService.getCanvasRect(previousCanvasIndex);
  }

  private updateCurrentCanvasGroupIndex(canvasGroupIndex: number) {
    this.canvasService.currentCanvasGroupIndex =
      this.canvasService.constrainToRange(canvasGroupIndex);
  }

  private shouldPanToCenter(): boolean {
    return (
      (!this.modeService.isPageZoomed() &&
        this.canvasService.getFitTo() === FitTo.NONE) || // If the viewer is in PAGE mode and is NOT fitted to width or height
      (this.modeService.isPageZoomed() &&
        !this.config.preserveZoomOnCanvasGroupChange)
    ); // If the viewer is ZOOMED and zoom should be preservedd
  }

  goToCanvasGroup(canvasGroup: CanvasGroup) {
    const currentCanvasGroupIndex = this.canvasService.currentCanvasGroupIndex;
    this.updateCurrentCanvasGroupIndex(canvasGroup.canvasGroupIndex);
    const newCanvasGroup = this.canvasService.getCanvasGroupRect(
      this.canvasService.currentCanvasGroupIndex,
    );
    const isNavigatingToPreviousCanvas =
      currentCanvasGroupIndex > canvasGroup.canvasGroupIndex;
    let y: number; // Change x to y
    let x = 0;

    if (this.shouldPanToCenter()) {
      this.panToCenter(newCanvasGroup, canvasGroup.immediately);
    } else {
      if (
        this.modeService.isPageZoomed() &&
        this.config.preserveZoomOnCanvasGroupChange
      ) {
        x =
          currentCanvasGroupIndex !== canvasGroup.canvasGroupIndex
            ? newCanvasGroup.x +
              this.getViewportBounds().width / 2 -
              this.viewer.collectionTileMargin
            : this.getViewportCenter().x;
      }

      if (isNavigatingToPreviousCanvas) {
        if (this.config.startOnTopOnCanvasGroupChange) {
          const previousCanvasGroup = this.getPreviousCanvasGroup(canvasGroup);
          y =
            this.viewingDirection === ViewingDirection.LTR
              ? this.topY(previousCanvasGroup)
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

      this.panTo(x, y, canvasGroup.immediately);
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
      const currentCanvasGroupIndex =
        this.canvasService.findClosestCanvasGroupIndex(
          this.getViewportCenter(),
        );
      const calculateNextCanvasGroupStrategy =
        CalculateNextCanvasGroupFactory.create(ViewerMode.NAVIGATOR);
      const nextCanvasGroupIndex =
        calculateNextCanvasGroupStrategy.calculateNextCanvasGroup({
          direction: Direction.NEXT,
          currentCanvasGroupIndex: currentCanvasGroupIndex,
          currentCanvasGroupCenter: currentCanvasIndex,
          viewingDirection: this.viewingDirection,
          scrollDirection: ScrollDirection.VERTICAL,
        });
      this.goToCanvasGroup({
        canvasGroupIndex: nextCanvasGroupIndex,
        immediately: false,
      });
    }
  }

  public centerCurrentCanvas(): void {
    const currentCanvasGroupIndex = this.canvasService.currentCanvasGroupIndex;
    const currentCanvasGroupCenter = this.canvasService.getCanvasGroupRect(
      currentCanvasGroupIndex,
    );
    this.panToCenter(currentCanvasGroupCenter, false);
  }

  private topY(canvas: Rect): number {
    return canvas.y + this.getViewportBounds().height / 2;
  }

  private bottomY(canvas: Rect): number {
    return canvas.y + canvas.height - this.getViewportBounds().height / 2;
  }

  private panToCenter(canvasGroup: Rect, immediately = false): void {
    this.panTo(canvasGroup.centerX, canvasGroup.centerY, immediately);
  }

  panToCenterVertically(immediately = false): void {
    const x = this.getViewportCenter().x;
    const y = 0;
    this.panTo(x, y, immediately);
  }

  panToCenterHorizontally(immediately = false): void {
    const x = 0;
    const y = this.getViewportCenter().y;
    this.panTo(x, y, immediately);
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
      immediately,
    );
  }

  private getViewportCenter(): Point {
    return this.viewer.viewport.getCenter(true);
  }

  private getViewportBounds(): Rect {
    return this.viewer.viewport.getBounds(true);
  }
}
