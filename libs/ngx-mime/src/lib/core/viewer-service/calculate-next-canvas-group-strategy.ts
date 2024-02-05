import { ScrollDirection } from '../models/scroll-direction';
import { Direction } from '../models/direction';
import { ViewingDirection } from '../models/viewing-direction';

export interface NextCanvasGroupCriteria {
  speed?: number;
  canvasGroupEndHitCountReached?: boolean;
  direction: Direction;
  currentCanvasGroupIndex: number;
  currentCanvasGroupCenter: number;
  viewingDirection: ViewingDirection;
  scrollDirection: ScrollDirection;
}

export interface CalculateNextCanvasGroupStrategy {
  calculateNextCanvasGroup(criteria: NextCanvasGroupCriteria): number;
}
