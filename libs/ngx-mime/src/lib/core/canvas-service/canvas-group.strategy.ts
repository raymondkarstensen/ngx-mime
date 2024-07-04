import { CanvasGroups } from '../models';

export interface AbstractCanvasGroupStrategy {
  addAll(tileSources: ReadonlyArray<any>): CanvasGroups;
}
