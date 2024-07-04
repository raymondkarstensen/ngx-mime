import { CanvasGroup } from '../canvas-service/tile-source-and-rect.model';
import {
  CanvasGroups,
  Rect,
  ScrollDirection,
  ViewingDirection,
} from '../models';
import { ViewerOptions } from '../models/viewer-options';
import { CanvasGroupPositionCriteria } from './calculate-canvas-group-position-strategy';

export class CalculateCanvasGroupPositionStrategy {
  constructor(
    private scrollDirection: ScrollDirection,
    private viewingDirection: ViewingDirection,
    private rotation: number,
  ) {
    this.scrollDirection = scrollDirection;
  }

  positionCanvasGroups(canvasGroups: CanvasGroups): CanvasGroups {
    const updatedCanvasGroups = new CanvasGroups();
    canvasGroups.canvasGroups.forEach((canvasGroup, index) => {
      const updatedCanvasGroup = this.calculateCanvasGroupPosition(
        {
          canvasGroupIndex: index,
          previousCanvasGroup: updatedCanvasGroups.canvasGroups[index - 1],
          currentCanvasGroup: canvasGroup,
          viewingDirection: this.viewingDirection,
        }
      );

      updatedCanvasGroups.canvasGroups.push(updatedCanvasGroup);
      updatedCanvasGroups.tileSourceAndRects.push(
        ...updatedCanvasGroup.tileSourceAndRects,
      );
    });
    updatedCanvasGroups.canvasesPerCanvasGroup =
      canvasGroups.canvasesPerCanvasGroup;

    return updatedCanvasGroups;
  }

  private calculateCanvasGroupPosition(
    criteria: CanvasGroupPositionCriteria,
  ): CanvasGroup {
    const needsReverse = this.needsReverse();
    const isSidewaysRotated = this.isSidewaysRotated();
    const currentCanvasGroupRect = criteria.currentCanvasGroup.rect;
    const tileSourceAndRects = needsReverse
      ? [...criteria.currentCanvasGroup.tileSourceAndRects].reverse()
      : criteria.currentCanvasGroup.tileSourceAndRects;

    let canvasX = 0;
    let canvasY = 0;

    if (this.scrollDirection === ScrollDirection.HORIZONTAL) {
      canvasX = this.getCanvasMainAxis(criteria);
      canvasY = (currentCanvasGroupRect.height / 2) * -1;
    } else {
      canvasY = this.getCanvasMainAxis(criteria);
      canvasX = (currentCanvasGroupRect.width / 2) * -1;
    }

    let stackAxis = isSidewaysRotated ? canvasY : canvasX;
    const updatedTileSourceAndRects = tileSourceAndRects.map(
      (tileSourceAndRect) => {
        let mainAxis = isSidewaysRotated ? canvasX : canvasY;
        mainAxis += isSidewaysRotated
          ? (currentCanvasGroupRect.width - tileSourceAndRect.rect.width) / 2
          : (currentCanvasGroupRect.height - tileSourceAndRect.rect.height) / 2;

        const tileX = isSidewaysRotated ? mainAxis : stackAxis;
        const tileY = isSidewaysRotated ? stackAxis : mainAxis;
        stackAxis += isSidewaysRotated
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

    if (needsReverse) {
      updatedTileSourceAndRects.reverse();
    }

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

  private needsReverse(): boolean {
    return this.rotation === 180 || this.rotation === 270;
  }

  private isSidewaysRotated(): boolean {
    return this.rotation === 90 || this.rotation === 270;
  }

  private getCanvasMainAxis(criteria: CanvasGroupPositionCriteria): number {
    const isHorizontal = this.scrollDirection === ScrollDirection.HORIZONTAL;
    const previousCanvasGroupRect = criteria.previousCanvasGroup?.rect;
    const currentCanvasGroupRect = criteria.currentCanvasGroup.rect;
    const margin = ViewerOptions.overlays.canvasGroupMarginInDashboardView;

    if (criteria.viewingDirection === ViewingDirection.RTL) {
      if (isHorizontal) {
        return previousCanvasGroupRect
          ? previousCanvasGroupRect.x - currentCanvasGroupRect.width - margin
          : 0;
      } else {
        return previousCanvasGroupRect
          ? previousCanvasGroupRect.y - currentCanvasGroupRect.height - margin
          : 0;
      }
    } else {
      if (isHorizontal) {
        return previousCanvasGroupRect
          ? previousCanvasGroupRect.x + previousCanvasGroupRect.width + margin
          : 0;
      } else {
        return previousCanvasGroupRect
          ? previousCanvasGroupRect.y + previousCanvasGroupRect.height + margin
          : 0;
      }
    }
  }
}
