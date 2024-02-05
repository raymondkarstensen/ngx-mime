import { ScrollDirection } from './scroll-direction';
import { CanvasGroups } from './canvas-groups';
import { Rect } from './rect';

describe('CanvasGroups', () => {
  it('should return closest index with horizontal scrolldirection', () => {
    const canvasGroups = new CanvasGroups();
    canvasGroups.add(new Rect({ x: 10, y: 0 }));
    canvasGroups.add(new Rect({ x: 20, y: 0 }));
    canvasGroups.add(new Rect({ x: 30, y: 0 }));
    canvasGroups.add(new Rect({ x: 40, y: 0 }));
    canvasGroups.add(new Rect({ x: 50, y: 0 }));
    canvasGroups.add(new Rect({ x: 60, y: 0 }));

    const index = canvasGroups.findClosestIndex(
      { x: 56, y: 0 },
      ScrollDirection.HORIZONTAL
    );

    expect(index).toBe(5);
  });

  it('should return closest index with vertical scrolldirection', () => {
    const canvasGroups = new CanvasGroups();
    canvasGroups.add(new Rect({ x: 0, y: 10 }));
    canvasGroups.add(new Rect({ x: 0, y: 20 }));
    canvasGroups.add(new Rect({ x: 0, y: 30 }));
    canvasGroups.add(new Rect({ x: 0, y: 40 }));
    canvasGroups.add(new Rect({ x: 0, y: 50 }));
    canvasGroups.add(new Rect({ x: 0, y: 60 }));

    const index = canvasGroups.findClosestIndex(
      { x: 0, y: 56 },
      ScrollDirection.VERTICAL
    );

    expect(index).toBe(5);
  });
});
