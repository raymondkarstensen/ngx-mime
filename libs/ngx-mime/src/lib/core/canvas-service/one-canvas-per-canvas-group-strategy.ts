import { createCanvasRect } from '../canvas-group-position/calculate-canvas-group-position-utils';
import { CalculateCanvasGroupPositionStrategy } from '../canvas-group-position/calculate-page-position-strategy';
import { MimeViewerConfig } from '../mime-viewer-config';
import {
  CanvasGroups,
  Rect,
  ScrollDirection,
  ViewerLayout,
  ViewingDirection,
} from '../models';
import { AbstractCanvasGroupStrategy } from './canvas-group.strategy';
import { CanvasGroup, TileSourceAndRect } from './tile-source-and-rect.model';

export class OneCanvasPerCanvasGroupStrategy
  implements AbstractCanvasGroupStrategy
{
  private positionStrategy: CalculateCanvasGroupPositionStrategy;

  constructor(
    private viewerLayout: ViewerLayout,
    private config: MimeViewerConfig,
    private viewingDirection: ViewingDirection,
    private scrollDirection: ScrollDirection,
    private rotation: number,
  ) {
    this.positionStrategy = new CalculateCanvasGroupPositionStrategy(
      this.scrollDirection,
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

    canvasGroups.canvasGroups = this.positionCanvasGroups(canvasGroups);

    return canvasGroups;
  }

  private positionCanvasGroups(canvasGroups: CanvasGroups): CanvasGroup[] {
    const updatedCanvasGroups: CanvasGroup[] = [];
    canvasGroups.canvasGroups.forEach((canvasGroup, index) => {
      updatedCanvasGroups.push(
        this.positionStrategy.calculateCanvasGroupPosition(
          {
            canvasGroupIndex: index,
            previousCanvasGroup: updatedCanvasGroups[index - 1],
            currentCanvasGroup: canvasGroup,
            viewingDirection: this.viewingDirection,
            viewerLayout: this.viewerLayout,
          },
          this.rotation,
        ),
      );
    });

    return updatedCanvasGroups;
  }

  private createCanvasGroup(tileSource: any, position: Rect): CanvasGroup {
    const tileSourceAndRect: TileSourceAndRect = { tileSource, rect: position };
    return { tileSourceAndRects: [tileSourceAndRect], rect: position };
  }
}
