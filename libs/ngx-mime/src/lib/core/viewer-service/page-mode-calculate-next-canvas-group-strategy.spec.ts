import { ScrollDirection } from '../models/scroll-direction';
import { Direction } from '../models/direction';
import { ViewingDirection } from '../models/viewing-direction';
import { PageModeCalculateNextCanvasGroupStrategy } from './page-mode-calculate-next-canvas-group-strategy';

describe('PageModeCalculateNextCanvasGroupStrategy ', () => {
  let scrollDirection: ScrollDirection;
  let strategy: PageModeCalculateNextCanvasGroupStrategy;

  beforeEach(() => {
    strategy = new PageModeCalculateNextCanvasGroupStrategy();
  });

  describe('horizontal scrollingdirection', () => {
    beforeEach(() => {
      scrollDirection = ScrollDirection.HORIZONTAL;
    });

    describe('LTR', () => {
      const viewingDirection = ViewingDirection.LTR;

      it('should stay on same canvas group when drag speed is low and same canvas group is currentCanvasGroupCenter', () => {
        const res = strategy.calculateNextCanvasGroup({
          speed: 199,
          direction: Direction.LEFT,
          currentCanvasGroupIndex: 1,
          currentCanvasGroupCenter: 1,
          viewingDirection,
          scrollDirection,
        });

        expect(res).toBe(1);
      });

      it('should get next canvas group if speed is high and direction is left', () => {
        const res = strategy.calculateNextCanvasGroup({
          speed: 200,
          direction: Direction.LEFT,
          currentCanvasGroupIndex: 1,
          currentCanvasGroupCenter: 1,
          viewingDirection,
          scrollDirection,
        });

        expect(res).toBe(2);
      });

      it('should get previous canvas group when speed is high and direction is right', () => {
        const res = strategy.calculateNextCanvasGroup({
          speed: 200,
          direction: Direction.RIGHT,
          currentCanvasGroupIndex: 2,
          currentCanvasGroupCenter: 2,
          viewingDirection,
          scrollDirection,
        });

        expect(res).toBe(1);
      });

      it('should get next canvas group when next page is currentCanvasGroupCenter', () => {
        const res = strategy.calculateNextCanvasGroup({
          speed: 199,
          direction: Direction.LEFT,
          currentCanvasGroupIndex: 1,
          currentCanvasGroupCenter: 2,
          viewingDirection,
          scrollDirection,
        });

        expect(res).toBe(2);
      });
    });

    describe('RTL', () => {
      const viewingDirection = ViewingDirection.RTL;

      it('should stay on same canvas group when drag speed is low and same canvas group is currentCanvasGroupCenter', () => {
        const res = strategy.calculateNextCanvasGroup({
          speed: 199,
          direction: Direction.RIGHT,
          currentCanvasGroupIndex: 1,
          currentCanvasGroupCenter: 1,
          viewingDirection: viewingDirection,
          scrollDirection,
        });

        expect(res).toBe(1);
      });

      it('should get next canvas group if speed is high and direction is right', () => {
        const res = strategy.calculateNextCanvasGroup({
          speed: 200,
          direction: Direction.RIGHT,
          currentCanvasGroupIndex: 1,
          currentCanvasGroupCenter: 1,
          viewingDirection,
          scrollDirection,
        });

        expect(res).toBe(2);
      });

      it('should get previous canvas group when speed is high and direction is left', () => {
        const res = strategy.calculateNextCanvasGroup({
          speed: 200,
          direction: Direction.LEFT,
          currentCanvasGroupIndex: 2,
          currentCanvasGroupCenter: 2,
          viewingDirection,
          scrollDirection,
        });

        expect(res).toBe(1);
      });

      it('should get next canvas group when next page is currentCanvasGroupCenter', () => {
        const res = strategy.calculateNextCanvasGroup({
          speed: 199,
          direction: Direction.RIGHT,
          currentCanvasGroupIndex: 1,
          currentCanvasGroupCenter: 2,
          viewingDirection,
          scrollDirection,
        });

        expect(res).toBe(2);
      });
    });
  });

  describe('vertical scrollingdirection', () => {
    beforeEach(() => {
      scrollDirection = ScrollDirection.VERTICAL;
    });

    describe('LTR', () => {
      const viewingDirection = ViewingDirection.LTR;

      it('should stay on same canvas group when drag speed is low and same canvas group is currentCanvasGroupCenter', () => {
        const res = strategy.calculateNextCanvasGroup({
          speed: 199,
          direction: Direction.UP,
          currentCanvasGroupIndex: 1,
          currentCanvasGroupCenter: 1,
          viewingDirection,
          scrollDirection,
        });

        expect(res).toBe(1);
      });

      it('should get next canvas group if speed is high and direction is up', () => {
        const res = strategy.calculateNextCanvasGroup({
          speed: 200,
          direction: Direction.UP,
          currentCanvasGroupIndex: 1,
          currentCanvasGroupCenter: 1,
          viewingDirection,
          scrollDirection,
        });

        expect(res).toBe(2);
      });

      it('should get previous canvas group when speed is high and direction is down', () => {
        const res = strategy.calculateNextCanvasGroup({
          speed: 200,
          direction: Direction.DOWN,
          currentCanvasGroupIndex: 2,
          currentCanvasGroupCenter: 2,
          viewingDirection,
          scrollDirection,
        });

        expect(res).toBe(1);
      });

      it('should get next canvas group when next page is currentCanvasGroupCenter', () => {
        const res = strategy.calculateNextCanvasGroup({
          speed: 199,
          direction: Direction.UP,
          currentCanvasGroupIndex: 1,
          currentCanvasGroupCenter: 2,
          viewingDirection,
          scrollDirection,
        });

        expect(res).toBe(2);
      });
    });

    describe('RTL', () => {
      const viewingDirection = ViewingDirection.RTL;

      it('should stay on same canvas group when drag speed is low and same canvas group is currentCanvasGroupCenter', () => {
        const res = strategy.calculateNextCanvasGroup({
          speed: 199,
          direction: Direction.DOWN,
          currentCanvasGroupIndex: 1,
          currentCanvasGroupCenter: 1,
          viewingDirection: viewingDirection,
          scrollDirection,
        });

        expect(res).toBe(1);
      });

      it('should get next canvas group if speed is high and direction is down', () => {
        const res = strategy.calculateNextCanvasGroup({
          speed: 200,
          direction: Direction.DOWN,
          currentCanvasGroupIndex: 1,
          currentCanvasGroupCenter: 1,
          viewingDirection,
          scrollDirection,
        });

        expect(res).toBe(2);
      });

      it('should get previous canvas group when speed is high and direction is up', () => {
        const res = strategy.calculateNextCanvasGroup({
          speed: 200,
          direction: Direction.UP,
          currentCanvasGroupIndex: 2,
          currentCanvasGroupCenter: 2,
          viewingDirection,
          scrollDirection,
        });

        expect(res).toBe(1);
      });

      it('should get next canvas group when next page is currentCanvasGroupCenter', () => {
        const res = strategy.calculateNextCanvasGroup({
          speed: 199,
          direction: Direction.UP,
          currentCanvasGroupIndex: 1,
          currentCanvasGroupCenter: 2,
          viewingDirection,
          scrollDirection,
        });

        expect(res).toBe(2);
      });
    });
  });
});
