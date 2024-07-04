import { createCanvasRect } from '../canvas-group-position/calculate-canvas-group-position-utils';
import { CalculateCanvasGroupPositionStrategy } from '../canvas-group-position/calculate-page-position-strategy';
import { MimeViewerConfig } from '../mime-viewer-config';
import {
  CanvasGroups,
  Rect,
  ScrollDirection,
  ViewingDirection,
} from '../models';
import { AbstractCanvasGroupStrategy } from './canvas-group.strategy';
import { CanvasGroup, TileSourceAndRect } from './tile-source-and-rect.model';

export class OneCanvasPerCanvasGroupStrategy
  implements AbstractCanvasGroupStrategy
{
  private positionStrategy: CalculateCanvasGroupPositionStrategy;

  constructor(
    private config: MimeViewerConfig,
    private viewingDirection: ViewingDirection,
    private scrollDirection: ScrollDirection,
    private rotation: number,
  ) {
    this.positionStrategy = new CalculateCanvasGroupPositionStrategy(
      this.scrollDirection,
      this.viewingDirection,
      this.rotation,
    );
  }

  addAll(tileSources: ReadonlyArray<any>): CanvasGroups {
    const canvasGroups = new CanvasGroups();

    tileSources.forEach((tileSource, index) => {
      const rect = createCanvasRect(
        this.rotation,
        tileSource,
        this.config.ignorePhysicalScale,
      );
      const newCanvasGroup = this.createCanvasGroup(tileSource, rect);

      canvasGroups.add(newCanvasGroup);
      canvasGroups.canvasesPerCanvasGroup.push([index]);
    });
    return this.positionStrategy.positionCanvasGroups(canvasGroups);
  }

  private createCanvasGroup(tileSource: any, position: Rect): CanvasGroup {
    const tileSourceAndRect: TileSourceAndRect = { tileSource, rect: position };
    return { tileSourceAndRects: [tileSourceAndRect], rect: position };
  }
}
