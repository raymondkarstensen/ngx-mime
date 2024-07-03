import { CanvasGroup } from '../canvas-service/tile-source-and-rect.model';
import { ViewerOptions } from '../models/viewer-options';
import { Rect, ScrollDirection } from '../models';
import { CanvasGroupPositionCriteria } from './calculate-canvas-group-position-strategy';

export class CalculateCanvasGroupPositionStrategy {
  constructor(private scrollDirection: ScrollDirection) {
    this.scrollDirection = scrollDirection;
  }

  calculateCanvasGroupPosition(
    criteria: CanvasGroupPositionCriteria,
    rotation: number,
  ): CanvasGroup {
    if (this.scrollDirection === ScrollDirection.HORIZONTAL) {
      return this.calculateHorizontalCanvasGroupPosition(criteria, rotation);
    } else {
      return this.calculateVerticalCanvasGroupPosition(criteria, rotation);
    }
  }

  private calculateHorizontalCanvasGroupPosition(
    criteria: CanvasGroupPositionCriteria,
    rotation = 0,
  ): CanvasGroup {
    const previousCanvasGroupRect = criteria.previousCanvasGroup?.rect;
    const currentCanvasGroupRect = criteria.currentCanvasGroup.rect;
    const isRotated = rotation === 90 || rotation === 270;
    const canvasX = previousCanvasGroupRect
      ? previousCanvasGroupRect.x +
        previousCanvasGroupRect.width +
        ViewerOptions.overlays.canvasGroupMarginInDashboardView
      : 0;
    const canvasY = (currentCanvasGroupRect.height / 2) * -1;

    let stackAxis = isRotated ? canvasY : canvasX;
    const updatedTileSourceAndRects =
      criteria.currentCanvasGroup.tileSourceAndRects.map(
        (tileSourceAndRect) => {
          let mainAxis = isRotated ? canvasX : canvasY;
          mainAxis += isRotated
            ? (currentCanvasGroupRect.width - tileSourceAndRect.rect.width) / 2
            : (currentCanvasGroupRect.height - tileSourceAndRect.rect.height) /
              2;

          const tileX = isRotated ? mainAxis : stackAxis;
          const tileY = isRotated ? stackAxis : mainAxis;
          stackAxis += isRotated
            ? tileSourceAndRect.rect.height
            : tileSourceAndRect.rect.width;

          return {
            tileSource: tileSourceAndRect.tileSource,
            rect: new Rect({
              x: tileX,
              y: tileY,
              width: tileSourceAndRect.rect.width,
              height: tileSourceAndRect.rect.height,
            }),
          };
        },
      );

    return {
      tileSourceAndRects: updatedTileSourceAndRects,
      rect: new Rect({
        x: canvasX,
        y: canvasY,
        width: currentCanvasGroupRect.width,
        height: currentCanvasGroupRect.height,
      }),
    };
  }

  private calculateVerticalCanvasGroupPosition(
    criteria: CanvasGroupPositionCriteria,
    rotation = 0,
  ): CanvasGroup {
    const previousCanvasGroupRect = criteria.previousCanvasGroup?.rect;
    const currentCanvasGroupRect = criteria.currentCanvasGroup.rect;
    const isRotated = rotation === 90 || rotation === 270;
    const canvasX = (currentCanvasGroupRect.width / 2) * -1;
    const canvasY = previousCanvasGroupRect
      ? previousCanvasGroupRect.y +
        previousCanvasGroupRect.height +
        ViewerOptions.overlays.canvasGroupMarginInDashboardView
      : 0;

    let stackAxis = isRotated ? canvasY : canvasX;
    const updatedTileSourceAndRects =
      criteria.currentCanvasGroup.tileSourceAndRects.map(
        (tileSourceAndRect) => {
          let mainAxis = isRotated ? canvasX : canvasY;
          mainAxis += isRotated
            ? (currentCanvasGroupRect.width - tileSourceAndRect.rect.width) / 2
            : (currentCanvasGroupRect.height - tileSourceAndRect.rect.height) /
              2;
          const tileX = isRotated ? mainAxis : stackAxis;
          const tileY = isRotated ? stackAxis : mainAxis;
          stackAxis += isRotated
            ? tileSourceAndRect.rect.height
            : tileSourceAndRect.rect.width;

          return {
            tileSource: tileSourceAndRect.tileSource,
            rect: new Rect({
              x: tileX,
              y: tileY,
              width: tileSourceAndRect.rect.width,
              height: tileSourceAndRect.rect.height,
            }),
          };
        },
      );

    return {
      tileSourceAndRects: updatedTileSourceAndRects,
      rect: new Rect({
        x: canvasX,
        y: canvasY,
        width: currentCanvasGroupRect.width,
        height: currentCanvasGroupRect.height,
      }),
    };
  }
}
