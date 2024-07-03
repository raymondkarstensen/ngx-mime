import { ScrollDirection } from './scroll-direction';
import { CanvasGroups } from './canvas-groups';
import { CanvasGroup } from '../canvas-service/tile-source-and-rect.model';
import { Rect } from './rect';

describe('CanvasGroups', () => {
  it('should return closest index with horizontal scrolldirection', () => {
    const canvasGroups = new CanvasGroups();
    canvasGroups.add(createGroup(new Rect({ x: 10, y: 0 })));
    canvasGroups.add(createGroup(new Rect({ x: 20, y: 0 })));
    canvasGroups.add(createGroup(new Rect({ x: 30, y: 0 })));
    canvasGroups.add(createGroup(new Rect({ x: 40, y: 0 })));
    canvasGroups.add(createGroup(new Rect({ x: 50, y: 0 })));
    canvasGroups.add(createGroup(new Rect({ x: 60, y: 0 })));

    const index = canvasGroups.findClosestIndex(
      { x: 56, y: 0 },
      ScrollDirection.HORIZONTAL
    );

    expect(index).toBe(5);
  });

  it('should return closest index with vertical scrolldirection', () => {
    const canvasGroups = new CanvasGroups();
    canvasGroups.add(createGroup(new Rect({ x: 0, y: 10 })));
    canvasGroups.add(createGroup(new Rect({ x: 0, y: 20 })));
    canvasGroups.add(createGroup(new Rect({ x: 0, y: 30 })));
    canvasGroups.add(createGroup(new Rect({ x: 0, y: 40 })));
    canvasGroups.add(createGroup(new Rect({ x: 0, y: 50 })));
    canvasGroups.add(createGroup(new Rect({ x: 0, y: 60 })));

    const index = canvasGroups.findClosestIndex(
      { x: 0, y: 56 },
      ScrollDirection.VERTICAL
    );

    expect(index).toBe(5);
  });

  function createGroup(rect: Rect): CanvasGroup {
    return {
      rect: rect,
      tileSourceAndRects: [],
    };
  }
});
