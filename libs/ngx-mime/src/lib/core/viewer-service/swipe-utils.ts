import { Rect } from '../models/rect';
import { Point } from '../models/point';
import { Side } from '../models/side';
import { Direction } from '../models/direction';
import { ViewerOptions } from '../models/viewer-options';

export class SwipeUtils {
  static getSwipeDirection(
    start: Point,
    end: Point,
    useThreshold?: boolean
  ): Direction {
    const deltaX = Math.abs(start.x - end.x);
    const deltaY = Math.abs(start.y - end.y);
    const threshold = useThreshold
      ? ViewerOptions.pan.swipeDirectionThreshold
      : 0;

    if (deltaX > deltaY + threshold) {
      // Horizontal Swipe
      return start.x > end.x ? Direction.LEFT : Direction.RIGHT;
    } else if (deltaY > deltaX + threshold) {
      // Vertical Swipe
      return start.y > end.y ? Direction.UP : Direction.DOWN;
    } else {
      return Direction.UNDEFINED;
    }
  }

  static getSideIfPanningPastEndOfCanvasGroup(
    canvasGroupRect: Rect,
    vpBounds: Rect
  ): Side | null {
    if (!this.isPanningOutsideCanvasGroup(canvasGroupRect, vpBounds))
      return null;

    const outSideLeft = vpBounds.x < canvasGroupRect.x;

    return outSideLeft ? Side.LEFT : Side.RIGHT;
  }

  static isPanningOutsideCanvasGroup(
    canvasGroupRect: Rect,
    vpBounds: Rect
  ): boolean {
    const isCanvasWiderThanViewport = canvasGroupRect.width > vpBounds.width;

    return isCanvasWiderThanViewport
      ? vpBounds.x < canvasGroupRect.x ||
          vpBounds.x + vpBounds.width >
            canvasGroupRect.x + canvasGroupRect.width
      : vpBounds.x + vpBounds.width <
          canvasGroupRect.x + canvasGroupRect.width ||
          vpBounds.x > canvasGroupRect.x;
  }

  static isDirectionInRightSemicircle(direction: number): boolean {
    return direction > -Math.PI / 2 && direction < Math.PI / 2;
  }

  static isDirectionInLeftSemicircle(direction: number): boolean {
    return !this.isDirectionInRightSemicircle(direction) || direction === 0;
  }
}
