import { Direction } from '../models/direction';
import { ScrollDirection } from '../models/scroll-direction';
import { ViewingDirection } from '../models/viewing-direction';
import {
  CalculateNextCanvasGroupStrategy,
  NextCanvasGroupCriteria,
} from './calculate-next-canvas-group-strategy';

export class DashboardModeCalculateNextCanvasGroupStrategy
  implements CalculateNextCanvasGroupStrategy
{
  calculateNextCanvasGroup(criteria: NextCanvasGroupCriteria): number {
    const speed = criteria.speed;
    const direction = criteria.direction;
    const currentCanvasGroupIndex = criteria.currentCanvasGroupIndex;
    const currentCanvasGroupCenter = criteria.currentCanvasGroupCenter;
    const isHorizontalScrollingDirection =
      criteria.scrollDirection === ScrollDirection.HORIZONTAL;
    let canvasGroupDelta = this.calculateNumberOfCanvasGroupsToGo(
      speed,
      isHorizontalScrollingDirection
    );
    if (canvasGroupDelta === 0) {
      return currentCanvasGroupCenter;
    }

    if (
      isHorizontalScrollingDirection &&
      this.isHorizontalDirection(direction)
    ) {
      canvasGroupDelta =
        direction === Direction.LEFT ? canvasGroupDelta : canvasGroupDelta * -1;
      return criteria.viewingDirection === ViewingDirection.LTR
        ? currentCanvasGroupIndex + canvasGroupDelta
        : currentCanvasGroupIndex - canvasGroupDelta;
    }

    if (
      !isHorizontalScrollingDirection &&
      this.isVerticalDirection(direction)
    ) {
      canvasGroupDelta =
        direction === Direction.UP ? canvasGroupDelta : canvasGroupDelta * -1;
      return criteria.viewingDirection === ViewingDirection.LTR
        ? currentCanvasGroupIndex + canvasGroupDelta
        : currentCanvasGroupIndex - canvasGroupDelta;
    }

    return currentCanvasGroupIndex;
  }

  private calculateNumberOfCanvasGroupsToGo(
    speed: number | undefined,
    isHorizontalScrollingDirection: boolean
  ): number {
    let canvasGroupsToGo = 10;
    if (speed !== undefined) {
      const threshold1 = isHorizontalScrollingDirection ? 500 : 1000;
      const threshold2 = isHorizontalScrollingDirection ? 1500 : 3000;
      const threshold3 = isHorizontalScrollingDirection ? 2500 : 5000;
      const maxThreshold = isHorizontalScrollingDirection ? 3500 : 7000;
      if (speed < threshold1) {
        canvasGroupsToGo = 0;
      } else if (speed >= threshold1 && speed < threshold2) {
        canvasGroupsToGo = 1;
      } else if (speed >= threshold2 && speed < threshold3) {
        canvasGroupsToGo = 3;
      } else if (speed >= threshold2 && speed < maxThreshold) {
        canvasGroupsToGo = 5;
      }
    }
    return canvasGroupsToGo;
  }

  private isHorizontalDirection(direction: Direction): boolean {
    return direction === Direction.LEFT || direction === Direction.RIGHT;
  }

  private isVerticalDirection(direction: Direction): boolean {
    return direction === Direction.UP || direction === Direction.DOWN;
  }
}
