import { Side } from '../models/side';
import { Rect } from '../models/rect';
import { Point } from '../models/point';
import { Direction } from '../models/direction';
import { ViewerOptions } from '../models/viewer-options';
import { SwipeUtils } from './swipe-utils';

describe('SwipeUtils ', () => {
  const swipeDirectionThreshold = ViewerOptions.pan.swipeDirectionThreshold;
  let canvasGroupRect: Rect;
  let viewportBounds: Rect;

  describe('getSwipeDirection', () => {
    describe('without threshold', () => {
      it('should return RIGHT when swiping right', () => {
        const start: Point = { x: 0, y: 50 };
        const end: Point = { x: 100, y: 50 };

        const direction = SwipeUtils.getSwipeDirection(start, end, false);

        expect(direction).toBe(Direction.RIGHT);
      });

      it('should return LEFT when swiping left', () => {
        const start: Point = { x: 100, y: 50 };
        const end: Point = { x: 0, y: 50 };

        const direction = SwipeUtils.getSwipeDirection(start, end, false);

        expect(direction).toBe(Direction.LEFT);
      });

      it('should return UP when swiping up', () => {
        const start: Point = { x: 50, y: 100 };
        const end: Point = { x: 50, y: 0 };

        const direction = SwipeUtils.getSwipeDirection(start, end, false);

        expect(direction).toBe(Direction.UP);
      });

      it('should return DOWN when swiping down', () => {
        const start: Point = { x: 50, y: 0 };
        const end: Point = { x: 50, y: 100 };

        const direction = SwipeUtils.getSwipeDirection(start, end, false);

        expect(direction).toBe(Direction.DOWN);
      });
    });

    describe('with treshold', () => {
      it('should return LEFT when swiping left', () => {
        const start: Point = { x: swipeDirectionThreshold + 1, y: 50 };
        const end: Point = { x: 0, y: 50 };

        const direction = SwipeUtils.getSwipeDirection(start, end, true);

        expect(direction).toBe(Direction.LEFT);
      });

      it('should return RIGHT when swiping right', () => {
        const start: Point = { x: 0, y: 50 };
        const end: Point = { x: swipeDirectionThreshold + 1, y: 50 };

        const direction = SwipeUtils.getSwipeDirection(start, end, true);

        expect(direction).toBe(Direction.RIGHT);
      });

      it('should return UP when swiping up', () => {
        const start: Point = { x: 50, y: swipeDirectionThreshold + 100 };
        const end: Point = { x: 50, y: 0 };

        const direction = SwipeUtils.getSwipeDirection(start, end, true);

        expect(direction).toBe(Direction.UP);
      });

      it('should return DOWN when swiping down', () => {
        const start: Point = { x: 50, y: 0 };
        const end: Point = { x: 50, y: swipeDirectionThreshold + 100 };

        const direction = SwipeUtils.getSwipeDirection(start, end, true);

        expect(direction).toBe(Direction.DOWN);
      });

      it('should return UNDEFINED when deltaY is higher than deltaX but below treshold', () => {
        const start: Point = { x: 0, y: 50 };
        const end: Point = { x: 0, y: 0 };

        const direction = SwipeUtils.getSwipeDirection(start, end, true);

        expect(direction).toBe(Direction.UNDEFINED);
      });

      it('should return UNDEFINED when deltaX is higher than deltaY but below treshold', () => {
        const start: Point = { x: 0, y: 0 };
        const end: Point = { x: 50, y: 0 };

        const direction = SwipeUtils.getSwipeDirection(start, end, true);

        expect(direction).toBe(Direction.UNDEFINED);
      });
    });
  });

  describe('panning outside right canvasGroupRect', () => {
    describe('when canvasGroupRect is outside viewportBounds', () => {
      beforeEach(() => {
        canvasGroupRect = new Rect({
          x: 0,
          y: 0,
          width: 200,
          height: 200,
        });
        // Pan outside right bounds
        viewportBounds = new Rect({
          x: 200,
          y: 0,
          width: 100,
          height: 100,
        });
      });

      it('isPanningOutsideCanvasGroup() should return true', () => {
        expect(
          SwipeUtils.isPanningOutsideCanvasGroup(
            canvasGroupRect,
            viewportBounds
          )
        ).toBe(true);
      });

      it('getSideIfPanningPastEndOfCanvasGroup() should return RIGHT', () => {
        expect(
          SwipeUtils.getSideIfPanningPastEndOfCanvasGroup(
            canvasGroupRect,
            viewportBounds
          )
        ).toBe(Side.RIGHT);
      });
    });

    describe('when canvasGroupRect is inside viewportBounds', () => {
      beforeEach(() => {
        canvasGroupRect = new Rect({
          x: 10,
          y: 0,
          width: 600,
          height: 600,
        });
        // Pan outside right bounds
        viewportBounds = new Rect({
          x: 100,
          y: 0,
          width: 800,
          height: 800,
        });
      });

      it('isPanningOutsideCanvasGroup() should return true', () => {
        expect(
          SwipeUtils.isPanningOutsideCanvasGroup(
            canvasGroupRect,
            viewportBounds
          )
        ).toBe(true);
      });

      it('getSideIfPanningPastEndOfCanvasGroup() should return RIGHT', () => {
        expect(
          SwipeUtils.getSideIfPanningPastEndOfCanvasGroup(
            canvasGroupRect,
            viewportBounds
          )
        ).toBe(Side.RIGHT);
      });
    });
  });

  describe('panning outside left canvasGroupRect', () => {
    describe('when canvasGroupRect is outside viewportBounds', () => {
      beforeEach(() => {
        canvasGroupRect = new Rect({
          x: 100,
          y: 0,
          width: 200,
          height: 200,
        });
        // Pan outside left bounds
        viewportBounds = new Rect({
          x: 99,
          y: 0,
          width: 100,
          height: 100,
        });
      });

      it('isPanningOutsideCanvasGroup() should return true', () => {
        expect(
          SwipeUtils.isPanningOutsideCanvasGroup(
            canvasGroupRect,
            viewportBounds
          )
        ).toBe(true);
      });

      it('getSideIfPanningPastEndOfCanvasGroup() should return LEFT', () => {
        expect(
          SwipeUtils.getSideIfPanningPastEndOfCanvasGroup(
            canvasGroupRect,
            viewportBounds
          )
        ).toBe(Side.LEFT);
      });
    });

    describe('when canvasGroupRect is inside viewportBounds', () => {
      beforeEach(() => {
        canvasGroupRect = new Rect({
          x: 700,
          y: 0,
          width: 600,
          height: 600,
        });
        // Pan outside left bounds
        viewportBounds = new Rect({
          x: 100,
          y: 0,
          width: 800,
          height: 800,
        });
      });

      it('isPanningOutsideCanvasGroup() should return true', () => {
        expect(
          SwipeUtils.isPanningOutsideCanvasGroup(
            canvasGroupRect,
            viewportBounds
          )
        ).toBe(true);
      });

      it('getSideIfPanningPastEndOfCanvasGroup() should return LEFT', () => {
        expect(
          SwipeUtils.getSideIfPanningPastEndOfCanvasGroup(
            canvasGroupRect,
            viewportBounds
          )
        ).toBe(Side.LEFT);
      });
    });
  });

  describe('when not panning outside canvasGroupRect', () => {
    beforeEach(() => {
      canvasGroupRect = new Rect({
        x: 0,
        y: 0,
        width: 200,
        height: 200,
      });
      // Panning inside bounds
      viewportBounds = new Rect({
        x: 60,
        y: 0,
        width: 100,
        height: 100,
      });
    });

    it('isPanningOutsideCanvasGroup() should return false', () => {
      expect(
        SwipeUtils.isPanningOutsideCanvasGroup(canvasGroupRect, viewportBounds)
      ).toBe(false);
    });

    it('getSideIfPanningPastEndOfCanvasGroup() should return null', () => {
      expect(
        SwipeUtils.getSideIfPanningPastEndOfCanvasGroup(
          canvasGroupRect,
          viewportBounds
        )
      ).toBe(null);
    });
  });

  it('should return true when direction is inside right semicircle', () => {
    let direction = Math.PI / 4;
    expect(SwipeUtils.isDirectionInRightSemicircle(direction)).toBe(true);

    direction = Math.PI / 8;
    expect(SwipeUtils.isDirectionInRightSemicircle(direction)).toBe(true);
  });

  it('should return true when direction is in left semicircle', () => {
    let direction = -Math.PI / 1.5;
    expect(SwipeUtils.isDirectionInLeftSemicircle(direction)).toBe(true);
    direction = 0; // means speed = 0
    expect(SwipeUtils.isDirectionInLeftSemicircle(direction)).toBe(true);
  });
});
