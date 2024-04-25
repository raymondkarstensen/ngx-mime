import { Direction } from './direction';

export interface CanvasGroup {
  canvasGroupIndex: number;
  canvasGroupEndHitCountReached?: boolean;
  direction?: Direction;
  immediately: boolean;
}
