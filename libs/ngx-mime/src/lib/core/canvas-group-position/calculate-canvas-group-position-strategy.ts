import { CanvasGroup } from '../canvas-service/tile-source-and-rect.model';
import { ViewingDirection } from '../models';

export interface CanvasGroupPositionCriteria {
  canvasGroupIndex: number;
  previousCanvasGroup: CanvasGroup;
  currentCanvasGroup: CanvasGroup;
  viewingDirection: ViewingDirection;
}
