import { Rect, Resource, ViewerLayout, ViewingDirection } from '../models';

export interface CanvasGroupPositionCriteria {
  canvasGroupIndex: number;
  canvasSource: Resource;
  previousCanvasGroupPosition: Rect;
  viewingDirection: ViewingDirection;
  viewerLayout: ViewerLayout;
}

export interface CalculateCanvasGroupPositionStrategy {
  calculateCanvasGroupPosition(
    criteria: CanvasGroupPositionCriteria,
    rotation: number,
  ): Rect;
}
