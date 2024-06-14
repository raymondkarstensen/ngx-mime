import { CanvasGroup, Direction, ScrollDirection } from '../../models';
import { DefaultGoToCanvasGroupStrategy } from './default-go-to-canvas-groups-strategy';

export class VerticalGoToCanvasGroupStrategy extends DefaultGoToCanvasGroupStrategy {
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
            ScrollDirection.VERTICAL,
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
            ScrollDirection.VERTICAL,
          ),
          immediately: false,
        },
        panToCenter,
      );
    }
  }
}
