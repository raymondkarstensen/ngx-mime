import { MimeViewerConfig } from '../mime-viewer-config';
import { Rect } from '../models/rect';
import { ViewerOptions } from '../models/viewer-options';
import { ViewingDirection } from '../models/viewing-direction';
import { ScrollDirection } from '../models/scroll-direction';
import {
  CalculateCanvasGroupPositionStrategy,
  CanvasGroupPositionCriteria,
} from './calculate-canvas-group-position-strategy';
import { canvasRectFromCriteria } from './calculate-canvas-group-position-utils';

export class OnePageCalculatePagePositionStrategy
  implements CalculateCanvasGroupPositionStrategy
{
  constructor(
    private config: MimeViewerConfig,
    private scrollDirection: ScrollDirection
  ) {}

  calculateCanvasGroupPosition(
    criteria: CanvasGroupPositionCriteria,
    rotation = 0
  ): Rect {
    if (this.scrollDirection === ScrollDirection.HORIZONTAL) {
      return this.calculateHorizontalCanvasGroupPosition(criteria, rotation);
    } else {
      return this.calculateVerticalCanvasGroupPosition(criteria, rotation);
    }
  }

  private calculateHorizontalCanvasGroupPosition(
    criteria: CanvasGroupPositionCriteria,
    rotation = 0
  ): Rect {
    let x: number;
    if (!criteria.canvasGroupIndex) {
      if (rotation === 90 || rotation === 270) {
        x = (criteria.canvasSource.height / 2) * -1;
      } else {
        x = (criteria.canvasSource.width / 2) * -1;
      }
    } else {
      x =
        criteria.viewingDirection === ViewingDirection.LTR
          ? this.calculateLtrX(criteria)
          : this.calculateRtlX(criteria);
    }
    return canvasRectFromCriteria(
      rotation,
      criteria,
      x,
      this.config.ignorePhysicalScale,
      this.scrollDirection
    );
  }

  private calculateVerticalCanvasGroupPosition(
    criteria: CanvasGroupPositionCriteria,
    rotation = 0
  ): Rect {
    let y: number;
    if (!criteria.canvasGroupIndex) {
      if (rotation === 90 || rotation === 270) {
        y = (criteria.canvasSource.width / 2) * -1;
      } else {
        y = (criteria.canvasSource.height / 2) * -1;
      }
    } else {
      y =
        criteria.viewingDirection === ViewingDirection.LTR
          ? this.calculateTopToBottomY(criteria)
          : this.calculateBottomToTopY(criteria);
    }
    return canvasRectFromCriteria(
      rotation,
      criteria,
      y,
      this.config.ignorePhysicalScale,
      this.scrollDirection
    );
  }

  private calculateLtrX(criteria: CanvasGroupPositionCriteria) {
    return (
      criteria.previousCanvasGroupPosition.x +
      criteria.previousCanvasGroupPosition.width +
      ViewerOptions.overlays.canvasGroupMarginInDashboardView
    );
  }

  private calculateRtlX(criteria: CanvasGroupPositionCriteria) {
    return (
      criteria.previousCanvasGroupPosition.x -
      criteria.previousCanvasGroupPosition.width -
      ViewerOptions.overlays.canvasGroupMarginInDashboardView
    );
  }

  private calculateTopToBottomY(criteria: CanvasGroupPositionCriteria) {
    return (
      criteria.previousCanvasGroupPosition.y +
      criteria.previousCanvasGroupPosition.height +
      ViewerOptions.overlays.canvasGroupMarginInDashboardView
    );
  }

  private calculateBottomToTopY(criteria: CanvasGroupPositionCriteria) {
    return (
      criteria.previousCanvasGroupPosition.y -
      criteria.previousCanvasGroupPosition.height -
      ViewerOptions.overlays.canvasGroupMarginInDashboardView
    );
  }
}
