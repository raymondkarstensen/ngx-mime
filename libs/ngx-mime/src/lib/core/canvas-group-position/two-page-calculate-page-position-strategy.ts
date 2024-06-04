import { MimeViewerConfig } from '../mime-viewer-config';
import { ViewerOptions } from '../models/viewer-options';
import { Rect, ScrollDirection, ViewingDirection } from '../models';
import {
  CalculateCanvasGroupPositionStrategy,
  CanvasGroupPositionCriteria,
} from './calculate-canvas-group-position-strategy';
import { canvasRectFromCriteria } from './calculate-canvas-group-position-utils';

export class TwoPageCalculateCanvasGroupPositionStrategy
  implements CalculateCanvasGroupPositionStrategy
{
  constructor(
    private config: MimeViewerConfig,
    private scrollDirection: ScrollDirection,
  ) {}

  calculateCanvasGroupPosition(
    criteria: CanvasGroupPositionCriteria,
    rotation = 0,
  ): Rect {
    if (this.scrollDirection === ScrollDirection.HORIZONTAL) {
      return this.calculateHorizontalCanvasGroupPosition(criteria, rotation);
    } else {
      return this.calculateVerticalCanvasGroupPosition(criteria, rotation);
    }
  }

  calculateHorizontalCanvasGroupPosition(
    criteria: CanvasGroupPositionCriteria,
    rotation = 0,
  ): Rect {
    let x: number;

    if (!criteria.canvasGroupIndex) {
      // First page
      x = 0;
    } else if (criteria.canvasGroupIndex % 2) {
      // Even page numbers
      x =
        criteria.viewingDirection === ViewingDirection.LTR
          ? this.calculateEvenLtrX(criteria)
          : this.calculateEvenRtlX(criteria);
    } else {
      // Odd page numbers
      x =
        criteria.viewingDirection === ViewingDirection.LTR
          ? this.calculateOddLtrX(criteria)
          : this.calculateOddRtlX(criteria);
    }

    return canvasRectFromCriteria(
      rotation,
      criteria,
      x,
      this.config.ignorePhysicalScale,
      this.scrollDirection,
    );
  }

  calculateVerticalCanvasGroupPosition(
    criteria: CanvasGroupPositionCriteria,
    rotation = 0,
  ): Rect {
    let y: number;
    let even = false;
    if (!criteria.canvasGroupIndex) {
      // First page
      y = 0;
    } else if (criteria.canvasGroupIndex % 2) {
      even = true;
      // Even page numbers / LEFT
      y = this.calculateEvenVerticalY(criteria);
    } else {
      // Odd page numbers / RIGHT
      y = this.calculateOddVerticalY(criteria);
    }
    return canvasRectFromCriteria(
      rotation,
      criteria,
      y,
      this.config.ignorePhysicalScale,
      this.scrollDirection,
      even,
    );
  }

  private calculateEvenVerticalY(criteria: CanvasGroupPositionCriteria) {
    return (
      criteria.previousCanvasGroupPosition.y +
      criteria.previousCanvasGroupPosition.height +
      ViewerOptions.overlays.canvasGroupMarginInDashboardView
    );
  }

  private calculateOddVerticalY(criteria: CanvasGroupPositionCriteria) {
    return (
      criteria.previousCanvasGroupPosition.y +
      criteria.previousCanvasGroupPosition.height
    );
  }

  private calculateEvenLtrX(criteria: CanvasGroupPositionCriteria) {
    return (
      criteria.previousCanvasGroupPosition.x +
      criteria.previousCanvasGroupPosition.width +
      ViewerOptions.overlays.canvasGroupMarginInDashboardView
    );
  }

  private calculateOddLtrX(criteria: CanvasGroupPositionCriteria) {
    return (
      criteria.previousCanvasGroupPosition.x +
      criteria.previousCanvasGroupPosition.width
    );
  }

  private calculateEvenRtlX(criteria: CanvasGroupPositionCriteria) {
    return (
      criteria.previousCanvasGroupPosition.x -
      criteria.canvasSource.width -
      ViewerOptions.overlays.canvasGroupMarginInDashboardView
    );
  }

  private calculateOddRtlX(criteria: CanvasGroupPositionCriteria) {
    return criteria.previousCanvasGroupPosition.x - criteria.canvasSource.width;
  }
}
