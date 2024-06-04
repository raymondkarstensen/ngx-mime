import { OnePageCalculatePagePositionStrategy } from '../canvas-group-position/one-page-calculate-page-position-strategy';
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
  private positionStrategy: OnePageCalculatePagePositionStrategy;

  constructor(
    private viewerLayout: ViewerLayout,
    private config: MimeViewerConfig,
    private viewingDirection: ViewingDirection,
    private scrollDirection: ScrollDirection,
    private rotation: number,
  ) {
    this.positionStrategy = new OnePageCalculatePagePositionStrategy(
      this.config,
      this.scrollDirection,
    );
  }

  addAll(tileSources: ReadonlyArray<any>): CanvasGroups {
    const canvasGroups = new CanvasGroups();

    tileSources.forEach((tileSource, index) => {
      const previousCanvasGroup = this.getPreviousCanvasGroup(
        canvasGroups,
        index,
      );
      const position = this.calculatePosition(
        tileSource,
        index,
        previousCanvasGroup,
      );
      const newCanvasGroup = this.createCanvasGroup(tileSource, position);

      canvasGroups.add(newCanvasGroup);
      canvasGroups.canvasesPerCanvasGroup.push([index]);
    });

    return canvasGroups;
  }

  private getPreviousCanvasGroup(
    canvasGroups: CanvasGroups,
    index: number,
  ): CanvasGroup | undefined {
    return index === 0
      ? undefined
      : canvasGroups.canvasGroups[canvasGroups.canvasGroups.length - 1];
  }

  private calculatePosition(
    tileSource: any,
    index: number,
    previousCanvasGroup?: CanvasGroup,
  ): Rect {
    console.log('her burde det va feil');
    return this.positionStrategy.calculateCanvasGroupPosition(
      {
        canvasGroupIndex: index,
        canvasSource: tileSource,
        previousCanvasGroupPosition: previousCanvasGroup
          ? previousCanvasGroup.rect
          : new Rect(),
        viewingDirection: this.viewingDirection,
        viewerLayout: this.viewerLayout,
      },
      this.rotation,
    );
  }

  private createCanvasGroup(tileSource: any, position: Rect): CanvasGroup {
    const tileSourceAndRect: TileSourceAndRect = { tileSource, rect: position };
    return { tileSourceAndRects: [tileSourceAndRect], rect: position };
  }
}
