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

export class TwoCanvasPerCanvasGroupStrategy
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
    // Add first single page
    this.addSinglePage(canvasGroups, tileSources[0], 0);

    for (let i = 1; i < tileSources.length; i += 2) {
      if (this.hasNextPage(tileSources, i)) {
        this.addPairedPages(canvasGroups, tileSources, i);
      } else {
        this.addSinglePage(canvasGroups, tileSources[i], i);
      }
    }

    return this.positionStrategy.positionCanvasGroups(canvasGroups);
  }

  private addSinglePage(
    canvasGroups: CanvasGroups,
    tilesource: any,
    index: number,
  ): void {
    const rect = createCanvasRect(
      this.rotation,
      tilesource,
      this.config.ignorePhysicalScale,
    );

    const tileSourceAndRect: TileSourceAndRect = {
      tileSource: tilesource,
      rect,
    };
    const newCanvasGroup: CanvasGroup = {
      tileSourceAndRects: [tileSourceAndRect],
      rect,
    };

    canvasGroups.add(newCanvasGroup);
    canvasGroups.canvasesPerCanvasGroup.push([index]);
  }

  private addPairedPages(
    canvasGroups: CanvasGroups,
    tileSources: ReadonlyArray<any>,
    index: number,
  ): void {
    const firstRect = createCanvasRect(
      this.rotation,
      tileSources[index],
      this.config.ignorePhysicalScale,
    );
    const firstTileSourceAndRect = {
      tileSource: tileSources[index],
      rect: firstRect,
    };

    const secondRect = createCanvasRect(
      this.rotation,
      tileSources[index + 1],
      this.config.ignorePhysicalScale,
    );
    const secondTileSourceAndRect = {
      tileSource: tileSources[index + 1],
      rect: secondRect,
    };

    const newCanvasGroup: CanvasGroup = {
      tileSourceAndRects: [firstTileSourceAndRect, secondTileSourceAndRect],
      rect: this.combineRects(
        firstTileSourceAndRect.rect,
        secondTileSourceAndRect.rect,
      ),
    };

    canvasGroups.add(newCanvasGroup);
    canvasGroups.canvasesPerCanvasGroup.push([index, index + 1]);
  }

  private hasNextPage(tileSources: ReadonlyArray<any>, index: number): boolean {
    return index + 1 < tileSources.length;
  }

  private combineRects(rect1: Rect, rect2: Rect): Rect {
    let width, height;

    if (this.rotation === 90 || this.rotation === 270) {
      width = Math.max(rect1.width, rect2.width);
      height = rect1.height + rect2.height;
    } else {
      width = rect1.width + rect2.width;
      height = Math.max(rect1.height, rect2.height);
    }

    return new Rect({
      width,
      height,
    });
  }
}
