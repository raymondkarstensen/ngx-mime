import { Point } from './point';
import { Rect } from './rect';
import { ScrollDirection } from './scroll-direction';

export class CanvasGroups {
  canvasGroupRects: Rect[] = [];
  canvasRects: Rect[] = [];
  canvasesPerCanvasGroup: number[][] = [];

  public add(rect: Rect): void {
    this.canvasGroupRects.push(rect);
  }

  public addRange(rects: Rect[]): void {
    this.canvasGroupRects = rects;
  }

  public get(index: number): Rect {
    return { ...this.canvasGroupRects[index] };
  }

  public findClosestIndex(point: Point, scrollDirection: ScrollDirection): number {
    let i = 0;
    let lastDelta: any;

    if (point === null) {
      return -1;
    }
    this.canvasGroupRects.some(function (rect: Rect, index: number) {
      let delta;
      if(scrollDirection === ScrollDirection.HORIZONTAL) {
        delta = Math.abs(point.x - rect.centerX);
      } else {
        delta = Math.abs(point.y - rect.centerY);
      }
      if (delta >= lastDelta) {
        return true;
      }
      i = index;
      lastDelta = delta;
      return false;
    });
    return i;
  }

  public length(): number {
    return this.canvasGroupRects.length;
  }
}
