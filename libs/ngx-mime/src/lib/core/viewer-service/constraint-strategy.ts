import { CanvasService } from '../canvas-service/canvas-service';
import { ModeService } from '../mode-service/mode.service';
import { Rect } from '../models/rect';

export interface Strategy {
  constraintCanvas(): void;
}

export class ConstraintStrategy implements Strategy {
  protected panStatus = false;

  constructor(
    protected modeService: ModeService,
    protected canvasService: CanvasService,
    protected viewer: any
  ) {}

  constraintCanvas(): void {
    throw new Error('Method not implemented.');
  }

  protected panTo(rect: Rect | undefined, immediately = false): void {
    if (rect) {
      this.viewer.viewport.panTo(
        {
          x: rect.x,
          y: rect.y,
        },
        immediately
      );
    }
  }

  protected getViewportBounds(): Rect {
    return this.viewer?.viewport.getBounds();
  }
}

export class HorizontalConstraintStrategy extends ConstraintStrategy implements Strategy {
  override constraintCanvas() {
    if (!this.panStatus) {
      const viewportBounds: Rect = this.getViewportBounds();
      const currentCanvasBounds = this.canvasService.getCurrentCanvasGroupRect();
      this.isCanvasOutsideViewport(viewportBounds, currentCanvasBounds)
        ? this.constraintCanvasOutsideViewport(viewportBounds, currentCanvasBounds)
        : this.constraintCanvasInsideViewport(viewportBounds);
    }
  }

  private isCanvasOutsideViewport(
    viewportBounds: Rect,
    canvasBounds: Rect
  ): boolean {
    return viewportBounds.height < canvasBounds.height;
  }

  private constraintCanvasOutsideViewport(
    viewportBounds: Rect,
    canvasBounds: Rect
  ): void {
    this.panStatus = true;
    let rect: Rect | undefined = undefined;
    if (this.isCanvasBelowViewportTop(viewportBounds, canvasBounds)) {
      rect = new Rect({
        x: viewportBounds.x + viewportBounds.width / 2,
        y: canvasBounds.y + viewportBounds.height / 2,
      });
      this.panTo(rect, false);
    } else if (this.isCanvasAboveViewportBottom(viewportBounds, canvasBounds)) {
      rect = new Rect({
        x: viewportBounds.x + viewportBounds.width / 2,
        y: canvasBounds.y + canvasBounds.height - viewportBounds.height / 2,
      });
      this.panTo(rect, false);
    }
    this.panStatus = false;
  }

  private constraintCanvasInsideViewport(viewportBounds: Rect): void {
    this.panStatus = true;
    const canvasGroupRect = this.canvasService.getCanvasGroupRect(
      this.canvasService.currentCanvasGroupIndex
    );
    const rect = new Rect({
      x: viewportBounds.x + viewportBounds.width / 2,
      y: canvasGroupRect.centerY,
    });
    this.panTo(rect, false);
    this.panStatus = false;
  }

  private isCanvasBelowViewportTop(
    viewportBounds: Rect,
    canvasBounds: Rect
  ): boolean {
    return viewportBounds.y < canvasBounds.y;
  }

  private isCanvasAboveViewportBottom(
    viewportBounds: Rect,
    canvasBounds: Rect
  ): boolean {
    return (
      canvasBounds.y + canvasBounds.height <
      viewportBounds.y + viewportBounds.height
    );
  }
}

export class VerticalConstraintStrategy extends ConstraintStrategy implements Strategy {
  override constraintCanvas(): void {
    if (!this.panStatus) {
      const viewportBounds: Rect = this.getViewportBounds();
      const currentCanvasGroupBounds = this.canvasService.getCurrentCanvasGroupRect();
      if (this.modeService.isPageZoomed()) {
        this.isCanvasOutsideViewport(viewportBounds, currentCanvasGroupBounds)
          ? this.constraintCanvasOutsideViewport(viewportBounds, currentCanvasGroupBounds)
          : this.constraintCanvasInsideViewport(viewportBounds);
      } else {
        this.snapToCenter(currentCanvasGroupBounds, viewportBounds);
      }
    }
  }

  private isCanvasOutsideViewport(
    viewportBounds: Rect,
    canvasBounds: Rect
  ): boolean {
    return viewportBounds.width < canvasBounds.width;
  }

  private constraintCanvasOutsideViewport(
    viewportBounds: Rect,
    canvasBounds: Rect
  ): void {
    if (this.isViewportLeftOfCanvas(viewportBounds, canvasBounds)) {
      this.snapToLeft(canvasBounds, viewportBounds);
    }
    if (this.isViewportRightOfCanvas(viewportBounds, canvasBounds)) {
      this.snapToRight(canvasBounds, viewportBounds);
    }
  }

  private constraintCanvasInsideViewport(viewportBounds: Rect): void {
    const canvasGroupRect = this.canvasService.getCanvasGroupRect(
      this.canvasService.currentCanvasGroupIndex
    );
    this.snapToCenter(canvasGroupRect, viewportBounds);
  }

  private isViewportLeftOfCanvas(viewportBounds: Rect, canvasBounds: Rect) {
    const isCanvasWiderThanViewport = canvasBounds.width > viewportBounds.width;
    return isCanvasWiderThanViewport
      ? viewportBounds.x < canvasBounds.x
      : canvasBounds.x + canvasBounds.width <
          viewportBounds.x + viewportBounds.width;
  }

  private isViewportRightOfCanvas(viewportBounds: Rect, canvasBounds: Rect) {
    const isCanvasWiderThanViewport = canvasBounds.width > viewportBounds.width;
    return isCanvasWiderThanViewport
      ? canvasBounds.x + canvasBounds.width <
          viewportBounds.x + viewportBounds.width
      : viewportBounds.x < canvasBounds.x;
  }

  private snapToLeft(canvasBounds: Rect, viewportBounds: Rect): void {
    this.panStatus = true;
    const rect = new Rect({
      x: canvasBounds.x + viewportBounds.width / 2,
      y: viewportBounds.y + viewportBounds.height / 2,
    });
    this.panTo(rect, false);
    this.panStatus = false;
  }

  private snapToRight(canvasBounds: Rect, viewportBounds: Rect): void {
    this.panStatus = true;
    const rect = new Rect({
      x: canvasBounds.x + canvasBounds.width - viewportBounds.width / 2,
      y: viewportBounds.y + viewportBounds.height / 2,
    });
    this.panTo(rect, false);
    this.panStatus = false;
  }

  private snapToCenter(canvasBounds: Rect, viewportBounds: Rect): void {
    this.panStatus = true;
    const rect = new Rect({
      x: canvasBounds.centerX,
      y: viewportBounds.y + viewportBounds.height / 2,
    });
    this.panTo(rect, false);
    this.panStatus = false;
  }
}
