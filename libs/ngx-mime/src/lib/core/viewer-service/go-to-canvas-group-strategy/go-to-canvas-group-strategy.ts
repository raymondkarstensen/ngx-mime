import { CanvasGroup } from '../../models';

export interface GoToCanvasGroupStrategy {
  adjustPosition(): void;
  goToCanvasGroup(canvasGroup: CanvasGroup, panToCenter?: boolean): void;
  goToPreviousCanvasGroup(
    currentCanvasIndex: number,
    panToCenter?: boolean,
  ): void;
  goToNextCanvasGroup(currentCanvasIndex: number, panToCenter?: boolean): void;
  centerCurrentCanvas(): void;
}
