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
    if (this.isPanningOutsideLeft(canvasGroupRect, vpBounds)) {
      return Side.LEFT;
    } else if (this.isPanningOutsideRight(canvasGroupRect, vpBounds)) {
      return Side.RIGHT;
    } else if (this.isPanningOutsideTop(canvasGroupRect, vpBounds)) {
      return Side.TOP;
    } else if (this.isPanningOutsideBottom(canvasGroupRect, vpBounds)) {
      return Side.BOTTOM;
    } else {
      return null;
    }
  }

  static isPanningOutsideCanvasGroup(
    canvasGroupRect: Rect,
    vpBounds: Rect
  ): boolean {
    return (
      this.isPanningOutsideLeft(canvasGroupRect, vpBounds) ||
      this.isPanningOutsideRight(canvasGroupRect, vpBounds) ||
      this.isPanningOutsideTop(canvasGroupRect, vpBounds) ||
      this.isPanningOutsideBottom(canvasGroupRect, vpBounds)
    );
  }

  static isPanningOutsideLeft(canvasGroupRect: Rect, vpBounds: Rect): boolean {
    return vpBounds.x < canvasGroupRect.x;
  }

  static isPanningOutsideRight(canvasGroupRect: Rect, vpBounds: Rect): boolean {
    return vpBounds.x + vpBounds.width > canvasGroupRect.x + canvasGroupRect.width;
  }

  static isPanningOutsideTop(canvasGroupRect: Rect, vpBounds: Rect): boolean {
    return vpBounds.y < canvasGroupRect.y;
  }

  static isPanningOutsideBottom(canvasGroupRect: Rect, vpBounds: Rect): boolean {
    return vpBounds.y + vpBounds.height > canvasGroupRect.y + canvasGroupRect.height;
  }

  static isDirectionInRightSemicircle(direction: number): boolean {
    return direction > -Math.PI / 2 && direction < Math.PI / 2;
  }

  static isDirectionInLeftSemicircle(direction: number): boolean {
    return !this.isDirectionInRightSemicircle(direction) || direction === 0;
  }
}
