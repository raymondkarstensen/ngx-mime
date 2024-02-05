import { Direction } from '../models/direction';
import { ScrollDirection } from '../models/scroll-direction';
import { Side } from '../models/side';
import { SwipeDragEndCounter } from './swipe-drag-end-counter';

describe('SwipeDragEndCounter ', () => {
  let counter: SwipeDragEndCounter;
  let scrollDirection: ScrollDirection;

  beforeEach(() => {
    counter = new SwipeDragEndCounter();
    scrollDirection = ScrollDirection.HORIZONTAL;
  });

  it('should be no hits initially', () => {
    expect(counter.previous).toBe(0);
  });

  it('should increment on left/right-hits', () => {
    counter.addHit(Side.LEFT, Direction.RIGHT, scrollDirection);
    expect(counter.previous).toBe(1);
    counter.addHit(Side.LEFT, Direction.RIGHT, scrollDirection);
    expect(counter.previous).toBe(2);
    counter.addHit(Side.RIGHT, Direction.LEFT, scrollDirection);
    expect(counter.next).toBe(1);
    counter.addHit(Side.RIGHT, Direction.LEFT, scrollDirection);
    expect(counter.next).toBe(2);
  });

  it('should not increment when side is not left/right', () => {
    counter.addHit(Side.TOP, Direction.UNDEFINED, scrollDirection);
    expect(counter.previous).toBe(0);
    expect(counter.next).toBe(0);
  });

  it('should reset counter of opposite side when incrementing a side', () => {
    counter.addHit(Side.LEFT, Direction.RIGHT, scrollDirection);
    expect(counter.previous).toBe(1);
    expect(counter.next).toBe(0);

    counter.addHit(Side.RIGHT, Direction.LEFT, scrollDirection);
    expect(counter.previous).toBe(0);
    expect(counter.next).toBe(1);

    counter.addHit(Side.RIGHT, Direction.LEFT, scrollDirection);
    expect(counter.previous).toBe(0);
    expect(counter.next).toBe(2);
  });

  it('should return true when one of the counts are 2', () => {
    counter.addHit(Side.LEFT, null, scrollDirection);
    counter.addHit(Side.LEFT, null, scrollDirection);
    expect(counter.hitCountReached()).toBe(true);
    counter.reset();
    expect(counter.hitCountReached()).toBe(false);
    counter.addHit(Side.RIGHT, null, scrollDirection);
    counter.addHit(Side.RIGHT, null, scrollDirection);
    expect(counter.hitCountReached()).toBe(true);
  });

  it('should clear counter of opposite side of dragging direction', () => {
    counter.addHit(Side.LEFT, null, scrollDirection);
    expect(counter.previous).toBe(1);

    counter.addHit(null, Direction.RIGHT, scrollDirection);
    expect(counter.next).toBe(0);

    counter.addHit(Side.RIGHT, null, scrollDirection);
    expect(counter.next).toBe(1);

    counter.addHit(null, Direction.LEFT, scrollDirection);
    expect(counter.previous).toBe(0);
  });
});
