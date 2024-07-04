import { MimeViewerConfig } from '../mime-viewer-config';
import { ScrollDirection, ViewerLayout, ViewingDirection } from '../models';
import { OneCanvasPerCanvasGroupStrategy } from './one-canvas-per-canvas-group-strategy';
import { TwoCanvasPerCanvasGroupStrategy } from './two-canvas-per-canvas-group-strategy';

export class CanvasGroupStrategyFactory {
  public static create(
    layout: ViewerLayout,
    config: MimeViewerConfig,
    viewingDirection: ViewingDirection,
    scrollDirection: ScrollDirection,
    rotation: number,
  ) {
    if (layout === ViewerLayout.ONE_PAGE) {
      return new OneCanvasPerCanvasGroupStrategy(
        config,
        viewingDirection,
        scrollDirection,
        rotation,
      );
    } else {
      return new TwoCanvasPerCanvasGroupStrategy(
        config,
        viewingDirection,
        scrollDirection,
        rotation,
      );
    }
  }
}
