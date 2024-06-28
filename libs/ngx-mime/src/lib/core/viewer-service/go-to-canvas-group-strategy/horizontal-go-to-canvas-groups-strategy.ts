import {
  CanvasGroup,
  Direction,
  Rect,
  ScrollDirection,
  ViewingDirection,
} from '../../models';
import { DefaultGoToCanvasGroupStrategy } from './default-go-to-canvas-groups-strategy';

export class HorizontalGoToCanvasGroupStrategy extends DefaultGoToCanvasGroupStrategy {
  override goToCanvasGroup(canvasGroup: CanvasGroup, panToCenter = false) {
    this.previousCanvasGroupIndex = this.canvasService.currentCanvasGroupIndex;
    this.updateCurrentCanvasGroupIndex(canvasGroup.canvasGroupIndex);

    if (this.canvasService.isFitToEnabled()) {
      this.updateViewerMode(canvasGroup);
    }

    if (panToCenter || this.shouldPanToCenter()) {
      this.panToCenter(
        this.canvasService.getCanvasGroupRect(canvasGroup.canvasGroupIndex),
        canvasGroup.immediately,
      );
    } else {
      const rect = this.getRect(
        this.previousCanvasGroupIndex,
        canvasGroup.canvasGroupIndex,
      );
      this.panTo(rect.x, rect.y, canvasGroup.immediately);
    }
  }

  override goToPreviousCanvasGroup(
    currentCanvasIndex: number,
    panToCenter = false,
  ): void {
    if (this.canvasService.isPreviousCanvasGroupValid()) {
      this.goToCanvasGroup(
        {
          canvasGroupIndex: this.getNextCanvasGroupIndex(
            currentCanvasIndex,
            Direction.PREVIOUS,
            ScrollDirection.HORIZONTAL,
          ),
          immediately: false,
        },
        panToCenter,
      );
    }
  }

  override goToNextCanvasGroup(
    currentCanvasIndex: number,
    panToCenter = false,
  ): void {
    if (this.canvasService.isNextCanvasGroupValid()) {
      this.goToCanvasGroup(
        {
          canvasGroupIndex: this.getNextCanvasGroupIndex(
            currentCanvasIndex,
            Direction.NEXT,
            ScrollDirection.HORIZONTAL,
          ),
          immediately: false,
        },
        panToCenter,
      );
    }
  }

  override getY(
    previousCanvasGroupIndex: number,
    nextCanvasGroupIndex: number,
  ): number {
    const currentCanvasGroupRect =
      this.canvasService.getCurrentCanvasGroupRect();
    return this.config.startOnTopOnCanvasGroupChange &&
      this.isNewCanvasGroup(previousCanvasGroupIndex, nextCanvasGroupIndex)
      ? currentCanvasGroupRect.y +
          this.getViewportBounds().height / 2 -
          this.viewer.collectionTileMargin
      : this.getViewportCenter().y;
  }

  override getX(
    previousCanvasGroupIndex: number,
    nextCanvasGroupIndex: number,
  ): number {
    const currentCanvasGroupRect =
      this.canvasService.getCurrentCanvasGroupRect();
    if (
      this.isNavigatingToPreviousCanvas(
        previousCanvasGroupIndex,
        nextCanvasGroupIndex,
      )
    ) {
      return this.viewingDirection === ViewingDirection.LTR
        ? this.rightX(currentCanvasGroupRect)
        : this.leftX(currentCanvasGroupRect);
    } else {
      return this.viewingDirection === ViewingDirection.LTR
        ? this.leftX(currentCanvasGroupRect)
        : this.rightX(currentCanvasGroupRect);
    }
  }

  private leftX(canvas: Rect): number {
    const x = canvas.x + this.getViewportBounds().width / 2;
    return this.zoomStrategy.isViewportLargerThanCanvasGroup()
      ? x
      : canvas.centerX;
  }

  private rightX(canvas: Rect): number {
    const x = canvas.x + canvas.width - this.getViewportBounds().width / 2;
    return this.zoomStrategy.isViewportLargerThanCanvasGroup()
      ? x
      : canvas.centerX;
  }
}
