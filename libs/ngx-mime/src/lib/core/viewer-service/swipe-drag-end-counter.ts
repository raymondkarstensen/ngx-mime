import { Direction } from '../models/direction';
import { ScrollDirection } from '../models/scroll-direction';
import { Side } from '../models/side';

export class SwipeDragEndCounter {
  public previous = 0;
  public next = 0;

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.previous = 0;
    this.next = 0;
  }

  /**
   * @param direction of swipe / pan
   * @param side hit by swipe
   */
  public addHit(
    side: Side | null,
    dir: Direction | null,
    scrollDirection: ScrollDirection
  ): void {
    if (side !== null) {
      this.incrementSide(side, scrollDirection);
    }
    if (dir !== null) {
      this.clearOppositeSideOfDragDirection(dir, scrollDirection);
    }
  }

  public hitCountReached(): boolean {
    return this.previous >= 2 || this.next >= 2;
  }

  private incrementSide(side: Side, scrollDirection: ScrollDirection): void {
    if (
      (scrollDirection === ScrollDirection.HORIZONTAL && side === Side.LEFT) ||
      (scrollDirection === ScrollDirection.VERTICAL && side === Side.TOP)
    ) {
      this.previous++;
      this.next = 0;
    } else if (
      (scrollDirection === ScrollDirection.HORIZONTAL && side === Side.RIGHT) ||
      (scrollDirection === ScrollDirection.VERTICAL && side === Side.BOTTOM)
    ) {
      this.next++;
      this.previous = 0;
    }
  }

  /**
   * Clear opposite side if swiping in the other direction
   * @param Direction of swipe / pan
   */
  private clearOppositeSideOfDragDirection(
    dir: Direction,
    scrollDirection: ScrollDirection
  ): void {
    if (dir === Direction.LEFT || dir === Direction.UP) {
      this.previous = 0;
    } else if (dir === Direction.RIGHT || dir === Direction.DOWN) {
      this.next = 0;
    }
  }
}
