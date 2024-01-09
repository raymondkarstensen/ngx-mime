import { Direction } from '../models/direction';
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
  public addHit(side: Side | null, dir: Direction | null): void {
    if (side !== null) {
      this.incrementSide(side);
    }
    if (dir !== null) {
      this.clearOppositeSideOfDragDirection(dir);
    }
  }

  public hitCountReached(): boolean {
    return this.previous >= 2 || this.next >= 2;
  }

  private incrementSide(side: Side): void {
    if (side === Side.LEFT || side === Side.TOP) {
      this.previous++;
      this.next = 0;
    } else if (side === Side.RIGHT || side === Side.BOTTOM) {
      this.next++;
      this.previous = 0;
    }
  }

  /**
   * Clear opposite side if swiping in the other direction
   * @param Direction of swipe / pan
   */
  private clearOppositeSideOfDragDirection(dir: Direction): void {
    if (dir === Direction.LEFT || dir === Direction.UP) {
      this.previous = 0;
    } else if (dir === Direction.RIGHT || dir === Direction.DOWN) {
      this.next = 0;
    }
  }
}
