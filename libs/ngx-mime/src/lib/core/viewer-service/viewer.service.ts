import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as d3 from 'd3';
import {
  BehaviorSubject,
  interval,
  Observable,
  Subject,
  Subscription,
} from 'rxjs';
import { distinctUntilChanged, sample } from 'rxjs/operators';
import { ModeService } from '../mode-service/mode.service';
import { AltoService } from '../alto-service/alto.service';
import { CalculateCanvasGroupPositionFactory } from '../canvas-group-position/calculate-canvas-group-position-factory';
import { CanvasService } from '../canvas-service/canvas-service';
import { ClickService } from '../click-service/click.service';
import { createSvgOverlay } from '../ext/svg-overlay';
import { IiifContentSearchService } from '../iiif-content-search-service/iiif-content-search.service';
import { ManifestUtils } from '../iiif-manifest-service/iiif-manifest-utils';
import { MimeViewerIntl } from '../intl';
import { MimeViewerConfig } from '../mime-viewer-config';
import {
  Direction,
  FitTo,
  Hit,
  Manifest,
  ModeChanges,
  PinchStatus,
  Point,
  RecognizedTextMode,
  RecognizedTextModeChanges,
  Rect,
  Resource,
  ScrollDirection,
  SearchResult,
  Side,
  ViewerLayout,
  ViewerMode,
  ViewerOptions,
  ViewingDirection,
} from '../models';
import { ScrollDirectionService } from '../scroll-direction-service/scroll-direction-service';
import { StyleService } from '../style-service/style.service';
import { ViewerLayoutService } from '../viewer-layout-service/viewer-layout-service';
import { CalculateNextCanvasGroupFactory } from './calculate-next-canvas-group-factory';
import { CanvasGroupMask } from './canvas-group-mask';
import {
  GoToCanvasGroupStrategy,
  HorizontalGoToCanvasGroupStrategy,
  VerticalGoToCanvasGroupStrategy,
} from './go-to-canvas-group-strategy';
import { OptionsFactory } from './options.factory';
import { SwipeDragEndCounter } from './swipe-drag-end-counter';
import { SwipeUtils } from './swipe-utils';
import { TileSourceStrategyFactory } from './tile-source-strategy-factory';
import { DefaultZoomStrategy, ZoomStrategy } from './zoom-strategy';
import {
  ConstraintStrategy,
  HorizontalConstraintStrategy,
  VerticalConstraintStrategy,
} from './constraint-strategy';

declare const OpenSeadragon: any;

@Injectable()
export class ViewerService {
  config!: MimeViewerConfig;
  private viewer?: any;
  private svgOverlay: any;
  private svgNode: any;

  private overlays: Array<SVGRectElement> = [];
  private tileSources: Array<Resource> = [];
  private subscriptions!: Subscription;

  public isCanvasPressed: Subject<boolean> = new BehaviorSubject<boolean>(
    false,
  );

  private currentCenter: Subject<Point> = new Subject();
  private currentCanvasIndex: BehaviorSubject<number> = new BehaviorSubject(0);
  private currentHit: Hit | null = null;
  private osdIsReady = new BehaviorSubject<boolean>(false);
  private swipeDragEndCounter = new SwipeDragEndCounter();
  private canvasGroupMask!: CanvasGroupMask;
  private pinchStatus = new PinchStatus();
  private dragStartPosition: any;
  private manifest!: Manifest;
  private isManifestPaged = false;
  private defaultKeyDownHandler: any;

  public currentSearch: SearchResult | null = null;
  private zoomStrategy!: ZoomStrategy;
  private goToCanvasGroupStrategy!: GoToCanvasGroupStrategy;
  private constraintStrategy!: ConstraintStrategy;

  private rotation: BehaviorSubject<number> = new BehaviorSubject(0);
  private dragStatus = false;
  private scrollPanFactor = 10;
  private isCanvasMaskEnabled = false;
  public id = 'ngx-mime-mimeViewer';
  public openseadragonId = 'openseadragon';
  fitTo = FitTo.NONE;

  constructor(
    private zone: NgZone,
    private clickService: ClickService,
    private canvasService: CanvasService,
    private modeService: ModeService,
    private viewerLayoutService: ViewerLayoutService,
    private iiifContentSearchService: IiifContentSearchService,
    private styleService: StyleService,
    private altoService: AltoService,
    private scrollDirectionService: ScrollDirectionService,
    private snackBar: MatSnackBar,
    private intl: MimeViewerIntl,
  ) {
    this.id = this.generateRandomId('ngx-mime-mimeViewer');
    this.openseadragonId = this.generateRandomId('openseadragon');
  }

  get onRotationChange(): Observable<number> {
    return this.rotation.asObservable().pipe(distinctUntilChanged());
  }

  get onCenterChange(): Observable<Point> {
    return this.currentCenter.asObservable();
  }

  get onCanvasGroupIndexChange(): Observable<number> {
    return this.currentCanvasIndex.asObservable().pipe(distinctUntilChanged());
  }

  get onOsdReadyChange(): Observable<boolean> {
    return this.osdIsReady.asObservable().pipe(distinctUntilChanged());
  }

  initialize() {
    this.unsubscribe();
    this.subscriptions = new Subscription();
  }

  setConfig(config: MimeViewerConfig) {
    this.config = config;
  }

  getViewer(): any {
    return this.viewer;
  }

  getTilesources(): Resource[] {
    return this.tileSources;
  }

  getOverlays(): SVGRectElement[] {
    return this.overlays;
  }

  getZoom(): number {
    return this.zoomStrategy.getZoom();
  }

  home(): void {
    if (!this.osdIsReady.getValue()) {
      return;
    }
    this.zoomStrategy.setMinZoom(this.modeService.mode);

    this.goToCanvasGroupStrategy.centerCurrentCanvas();

    this.canvasService.resetFitTo();
    this.goToHomeZoom();
  }

  goToPreviousCanvasGroup(panToCenter = false): void {
    this.goToCanvasGroupStrategy.goToPreviousCanvasGroup(
      this.currentCanvasIndex.getValue(),
      panToCenter,
    );
  }

  goToNextCanvasGroup(panToCenter = false): void {
    this.goToCanvasGroupStrategy.goToNextCanvasGroup(
      this.currentCanvasIndex.getValue(),
      panToCenter,
    );
  }

  goToCanvasGroup(canvasGroupIndex: number, immediately: boolean): void {
    this.goToCanvasGroupStrategy.goToCanvasGroup({
      canvasGroupIndex: canvasGroupIndex,
      immediately: immediately,
    });
  }

  goToCanvas(canvasIndex: number, immediately: boolean): void {
    const canvasGroupIndex =
      this.canvasService.findCanvasGroupByCanvasIndex(canvasIndex);
    this.goToCanvasGroup(canvasGroupIndex, immediately);
  }

  highlight(searchResult: SearchResult): void {
    this.clearHightlight();
    if (this.viewer) {
      if (searchResult.q) {
        this.currentSearch = searchResult;
      }

      const rotation = this.rotation.getValue();

      for (const hit of searchResult.hits) {
        for (const highlightRect of hit.highlightRects) {
          const canvasRect = this.canvasService.getCanvasRect(
            highlightRect.canvasIndex,
          );
          if (canvasRect) {
            const currentHitStrokeOffset = 8;
            let width = highlightRect.width + currentHitStrokeOffset;
            let height = highlightRect.height + currentHitStrokeOffset;
            let x = canvasRect.x - currentHitStrokeOffset / 2;
            let y = canvasRect.y - currentHitStrokeOffset / 2;

            /* hit rect are relative to each unrotated page canvasRect so x,y must be adjusted by the remaining space */
            switch (rotation) {
              case 0:
                x += highlightRect.x;
                y += highlightRect.y;
                break;

              case 90:
                x += canvasRect.width - highlightRect.y - highlightRect.height;
                y += highlightRect.x;
                /* Flip height & width */
                width = highlightRect.height + currentHitStrokeOffset;
                height = highlightRect.width + currentHitStrokeOffset;
                break;

              case 180:
                x += canvasRect.width - (highlightRect.x + highlightRect.width);
                y +=
                  canvasRect.height - (highlightRect.y + highlightRect.height);
                break;

              case 270:
                x += highlightRect.y;
                y += canvasRect.height - highlightRect.x - highlightRect.width;
                /* Flip height & width */
                width = highlightRect.height + currentHitStrokeOffset;
                height = highlightRect.width + currentHitStrokeOffset;
                break;
            }

            const currentOverlay: SVGRectElement = this.svgNode
              .append('rect')
              .attr('mimeHitIndex', hit.id)
              .attr('x', x)
              .attr('y', y)
              .attr('width', width)
              .attr('height', height)
              .attr('class', 'hit');
          }
        }
      }
    }
  }

  clearHightlight(): void {
    if (this.svgNode) {
      this.svgNode.selectAll('.hit').remove();
      this.currentSearch = null;
    }
  }

  setUpViewer(manifest: Manifest, config: MimeViewerConfig) {
    this.config = config;

    if (manifest && manifest.tileSource) {
      this.tileSources = manifest.tileSource;
      this.zone.runOutsideAngular(() => {
        this.manifest = manifest;
        this.isManifestPaged = ManifestUtils.isManifestPaged(this.manifest);
        this.viewer = new OpenSeadragon.Viewer(
          OptionsFactory.create(this.openseadragonId, this.config),
        );
        createSvgOverlay();
        this.zoomStrategy = new DefaultZoomStrategy(
          this.viewer,
          this.canvasService,
          this.modeService,
          this.viewerLayoutService,
        );
        this.goToCanvasGroupStrategy = new HorizontalGoToCanvasGroupStrategy(
          this.viewer,
          this.zoomStrategy,
          this.canvasService,
          this.modeService,
          this.config,
          this.manifest.viewingDirection,
        );
        this.constraintStrategy = new HorizontalConstraintStrategy(
          this.modeService,
          this.canvasService,
          this.viewer,
        );
        /*
          This disables keyboard navigation in openseadragon.
          We use s for opening search dialog and OSD use the same key for panning.
          Issue: https://github.com/openseadragon/openseadragon/issues/794
         */
        this.defaultKeyDownHandler = this.viewer.innerTracker.keyDownHandler;
        this.disableKeyDownHandler();
        this.viewer.innerTracker.keyHandler = null;
        this.canvasService.reset();
        this.canvasGroupMask = new CanvasGroupMask(
          this.viewer,
          this.styleService,
        );
      });

      this.addToWindow();
      this.setupOverlays();
      this.createOverlays();
      this.addEvents();
      this.addSubscriptions();
    }
  }

  /**
   *
   * @param layoutSwitch true if switching between layouts
   * to keep current search-state and rotation
   */
  destroy(layoutSwitch?: boolean) {
    this.osdIsReady.next(false);
    this.currentCenter.next({ x: 0, y: 0 });
    if (this.viewer != null && this.viewer.isOpen()) {
      if (this.viewer.container != null) {
        d3.select(this.viewer.container.parentNode).style('opacity', '0');
      }
      this.viewer.destroy();
      this.viewer = null;
    }
    this.overlays = [];
    this.canvasService.reset();
    if (this.canvasGroupMask) {
      this.canvasGroupMask.destroy();
    }
    // Keep search-state and rotation only if layout-switch
    if (!layoutSwitch) {
      this.altoService.destroy();
      this.currentSearch = null;
      this.iiifContentSearchService.destroy();
      this.rotation.next(0);
      this.modeService.destroy();
      this.unsubscribe();
    }
  }

  zoomIn(zoomFactor?: number, position?: Point): void {
    this.canvasService.resetFitTo();
    this.zoomStrategy.zoomIn(zoomFactor, position);
  }

  zoomOut(zoomFactor?: number, position?: Point): void {
    this.canvasService.resetFitTo();
    this.zoomStrategy.zoomOut(zoomFactor, position);
  }

  goToHomeZoom(): void {
    this.zoomStrategy.goToHomeZoom();
  }

  rotate(): void {
    if (this.osdIsReady.getValue()) {
      if (this.viewer.useCanvas) {
        this.rotateToRight();
        this.highlightCurrentHit();
      } else {
        this.showRotationIsNotSupportetMessage();
      }
    }
  }

  /**
   * Returns overlay-index for click-event if hit
   * @param target hit <rect>
   */
  getOverlayIndexFromClickEvent(event: any) {
    const target = this.getOriginalTarget(event);
    if (this.isCanvasGroupHit(target)) {
      const requestedCanvasGroup: number = this.overlays.indexOf(target);
      if (requestedCanvasGroup >= 0) {
        return requestedCanvasGroup;
      }
    }
    return -1;
  }

  /**
   * Checks if hit element is a <rect>-element
   * @param target
   */
  isCanvasGroupHit(target: HTMLElement): boolean {
    return target instanceof SVGRectElement;
  }

  private addSubscriptions(): void {
    this.initialize();
    this.subscriptions.add(
      this.modeService.onChange.subscribe((mode: ModeChanges) => {
        this.modeChanged(mode);
      }),
    );

    this.zone.runOutsideAngular(() => {
      this.subscriptions.add(
        this.onCenterChange
          .pipe(sample(interval(500)))
          .subscribe((center: Point) => {
            this.calculateCurrentCanvasGroup(center);
            if (center && center !== null) {
              this.osdIsReady.next(true);
            }
          }),
      );
    });

    this.subscriptions.add(
      this.canvasService.onCanvasGroupIndexChange.subscribe(
        async (canvasGroupIndex: number) => {
          this.swipeDragEndCounter.reset();
          if (canvasGroupIndex !== -1) {
            this.canvasGroupMask.changeCanvasGroup(
              this.canvasService.getCanvasGroupRect(canvasGroupIndex),
            );
            if (
              (this.modeService.isPage() || this.modeService.isDashBoard()) &&
              !this.canvasService.isFitToEnabled()
            ) {
              this.goToHomeZoom();
            }
          }
        },
      ),
    );

    this.subscriptions.add(
      this.onCanvasGroupIndexChange.subscribe((canvasGroupIndex: number) => {
        this.canvasService.currentCanvasGroupIndex = canvasGroupIndex;
        if (this.canvasService.isFitToEnabled()) {
          this.updateFitTo(false);
        }
      }),
    );

    this.subscriptions.add(
      this.onOsdReadyChange.subscribe((state: boolean) => {
        if (state) {
          this.initialCanvasGroupLoaded();
          this.currentCenter.next(this.viewer?.viewport.getCenter(true));
        }
      }),
    );

    this.subscriptions.add(
      this.viewerLayoutService.onChange.subscribe((state: ViewerLayout) => {
        this.layoutPages();
      }),
    );

    this.subscriptions.add(
      this.iiifContentSearchService.onSelected.subscribe((hit: Hit | null) => {
        if (hit) {
          this.currentHit = hit;
          this.highlightCurrentHit();
          this.goToCanvas(hit.index, false);
        }
      }),
    );

    this.subscriptions.add(
      this.onRotationChange.subscribe((rotation: number) => {
        this.layoutPages();
      }),
    );

    this.subscriptions.add(
      this.altoService.onRecognizedTextContentModeChange$.subscribe(
        (recognizedTextModeChanges: RecognizedTextModeChanges) => {
          if (
            recognizedTextModeChanges.currentValue === RecognizedTextMode.ONLY
          ) {
            this.hidePages();
          }

          if (
            recognizedTextModeChanges.previousValue === RecognizedTextMode.ONLY
          ) {
            this.showPages();
          }

          if (
            recognizedTextModeChanges.previousValue ===
              RecognizedTextMode.ONLY &&
            recognizedTextModeChanges.currentValue === RecognizedTextMode.SPLIT
          ) {
            setTimeout(() => {
              this.home();
            }, ViewerOptions.transitions.OSDAnimationTime);
          }
        },
      ),
    );

    this.subscriptions.add(
      this.scrollDirectionService.onChange.subscribe(
        (scrollDirection: ScrollDirection) => {
          this.isCanvasMaskEnabled = false;
          if (scrollDirection === ScrollDirection.VERTICAL) {
            this.goToCanvasGroupStrategy = new VerticalGoToCanvasGroupStrategy(
              this.viewer,
              this.zoomStrategy,
              this.canvasService,
              this.modeService,
              this.config,
              this.manifest.viewingDirection,
            );
            this.constraintStrategy = new VerticalConstraintStrategy(
              this.modeService,
              this.canvasService,
              this.viewer,
            );
          } else if (scrollDirection === ScrollDirection.HORIZONTAL) {
            this.isCanvasMaskEnabled = true;
            this.goToCanvasGroupStrategy =
              new HorizontalGoToCanvasGroupStrategy(
                this.viewer,
                this.zoomStrategy,
                this.canvasService,
                this.modeService,
                this.config,
                this.manifest.viewingDirection,
              );
            this.constraintStrategy = new HorizontalConstraintStrategy(
              this.modeService,
              this.canvasService,
              this.viewer,
            );
          }
          this.layoutPages();
        },
      ),
    );

    this.subscriptions.add(
      this.canvasService.fitTo$.subscribe((fitTo: FitTo) => {
        const initialToggle: boolean =
          !this.canvasService.isFitToEnabled() && fitTo !== this.fitTo;
        this.fitTo = fitTo;
        this.updateFitTo(initialToggle);
      }),
    );
  }

  private highlightCurrentHit() {
    if (this.currentHit) {
      this.svgNode.selectAll(`g > rect.selected`).attr('class', 'hit');
      this.svgNode
        .selectAll(`g > rect[mimeHitIndex='${this.currentHit.id}']`)
        .attr('class', 'hit selected');
    }
  }

  private hidePages() {
    this.setOpacityOnPages(0);
  }

  private showPages() {
    this.setOpacityOnPages(1);
  }

  private layoutPages() {
    if (this.osdIsReady.getValue()) {
      const currentCanvasIndex = this.canvasService.currentCanvasIndex;
      this.destroy(true);
      this.setUpViewer(this.manifest, this.config);
      this.goToCanvas(currentCanvasIndex, false);

      // Recreate highlights if there is an active search going on
      if (this.currentSearch) {
        this.highlight(this.currentSearch);
      }
    }
  }

  private addToWindow() {
    (<any>window).openSeadragonViewer = this.viewer;
  }

  private setupOverlays(): void {
    this.svgOverlay = this.viewer.svgOverlay();
    this.svgNode = d3.select(this.svgOverlay.node());
  }

  private addEvents(): void {
    this.clickService.reset();
    this.clickService.addSingleClickHandler(this.singleClickHandler);
    this.clickService.addDoubleClickHandler(this.dblClickHandler);
    this.viewer.addHandler('animation-finish', () => {
      this.currentCenter.next(this.viewer?.viewport.getCenter(true));
    });
    this.viewer.addHandler('canvas-click', this.clickService.click);
    this.viewer.addHandler(
      'canvas-double-click',
      (e: any) => (e.preventDefaultAction = true),
    );
    this.viewer.addHandler('canvas-press', (e: any) => {
      this.pinchStatus.active = false;
      this.dragStartPosition = e.position;
      this.isCanvasPressed.next(true);
    });
    this.viewer.addHandler('canvas-release', () =>
      this.isCanvasPressed.next(false),
    );
    this.viewer.addHandler('canvas-scroll', this.scrollHandler);
    this.viewer.addHandler('canvas-pinch', this.pinchHandler);

    this.viewer.addHandler('canvas-drag', (e: any) => {
      this.dragStatus = true;
    });
    this.viewer.addHandler('canvas-drag-end', this.dragEndHandler);
    this.viewer.addHandler('animation', (e: any) => {
      this.currentCenter.next(this.viewer?.viewport.getCenter(true));
    });
    this.viewer.addHandler('pan', this.panHandler);
    this.viewer.addHandler('zoom', this.zoomHandler);
  }

  /**
   * Callback for mode-change
   * @param mode ViewerMode
   */
  private modeChanged(mode: ModeChanges): void {
    if (!this.viewer) {
      return;
    }
    this.updatePanningConstraints();
    if (mode.currentValue === ViewerMode.DASHBOARD) {
      this.toggleToDashboard();
      this.disableKeyDownHandler();
    } else if (mode.currentValue === ViewerMode.PAGE) {
      this.toggleToPage();
      this.disableKeyDownHandler();
    } else if (mode.currentValue === ViewerMode.PAGE_ZOOMED) {
      this.zoomStrategy.setMinZoom(ViewerMode.PAGE_ZOOMED);
      this.resetKeyDownHandler();
    }
  }

  private updatePanningConstraints(): void {
    if (this.scrollDirectionService.isHorizontalScrollingDirection()) {
      this.enableHorizontalPanning();
      this.enableVerticalPanning();
      if (
        this.modeService.isPage() ||
        this.canvasService.isFitToHeightEnabled()
      ) {
        this.disableVerticalPanning();
      }
    } else {
      this.enableHorizontalPanning();
      this.enableVerticalPanning();
      if (
        this.modeService.isPage() ||
        this.canvasService.isFitToWidthEnabled()
      ) {
        this.disableHorizontalPanning();
      }
    }
  }

  /**
   *
   * @param point to zoom to. If not set, the viewer will zoom to center
   */
  private zoomInGesture(position: Point, zoomFactor?: number): void {
    if (this.modeService.mode === ViewerMode.DASHBOARD) {
      this.modeService.mode = ViewerMode.PAGE;
    } else {
      if (position) {
        this.zoomIn(zoomFactor, position);
      } else {
        this.zoomIn();
      }
    }
  }

  private zoomOutGesture(position: Point, zoomFactor?: number): void {
    if (this.modeService.isPageZoomed()) {
      this.zoomOut(zoomFactor, position);
    } else if (this.modeService.mode === ViewerMode.PAGE) {
      this.modeService.mode = ViewerMode.DASHBOARD;
    }
  }

  /**
   * Process zoom in pinch gesture (pinch out)
   *
   * Toggle to page mode and Zoom in
   *
   * @param event from pinch gesture
   */
  private zoomInPinchGesture(event: any, zoomFactor: number): void {
    if (this.modeService.mode === ViewerMode.DASHBOARD) {
      this.modeService.mode = ViewerMode.PAGE;
    } else {
      this.zoomIn(zoomFactor, this.dragStartPosition || event.center);
    }
  }

  /**
   * Process zoom out pinch gesture (pinch in)
   *
   * Zoom out and toggle to dashboard when all zoomed out.
   * Stop between zooming out and toggling to dashboard.
   *
   * @param event from pinch gesture
   */
  private zoomOutPinchGesture(event: any, zoomFactor: number): void {
    const gestureId = event.gesturePoints[0].id;
    if (this.modeService.isPageZoomed()) {
      this.pinchStatus.shouldStop = true;
      this.zoomOut(zoomFactor, event.center);
    } else if (this.modeService.mode === ViewerMode.PAGE) {
      if (
        !this.pinchStatus.shouldStop ||
        gestureId === this.pinchStatus.previousGestureId + 2
      ) {
        this.pinchStatus.shouldStop = false;
        this.modeService.toggleMode();
      }
      this.pinchStatus.previousGestureId = gestureId;
    }
  }

  /**
   * Iterates tilesources and adds them to viewer
   * Creates svg clickable overlays for each tile
   */
  private createOverlays(): void {
    this.overlays = [];
    const canvasRects: Rect[] = [];
    const calculateCanvasGroupPositionStrategy =
      CalculateCanvasGroupPositionFactory.create(
        this.viewerLayoutService.layout,
        this.isManifestPaged,
        this.config,
        this.scrollDirectionService.scrollDirection,
      );

    const isTwoPageView: boolean =
      this.viewerLayoutService.layout === ViewerLayout.TWO_PAGE;
    const rotation = this.rotation.getValue();
    let group: any = this.svgNode.append('g').attr('class', 'page-group');

    this.tileSources.forEach((tile, i) => {
      const position =
        calculateCanvasGroupPositionStrategy.calculateCanvasGroupPosition(
          {
            canvasGroupIndex: i,
            canvasSource: tile,
            previousCanvasGroupPosition: canvasRects[i - 1],
            viewingDirection: this.manifest.viewingDirection,
            viewerLayout: this.viewerLayoutService.layout,
            scrollDirection: this.scrollDirectionService.scrollDirection,
          },
          rotation,
        );

      canvasRects.push(position);

      const tileSourceStrategy = TileSourceStrategyFactory.create(tile);
      const tileSource = tileSourceStrategy.getTileSource(tile);

      this.zone.runOutsideAngular(() => {
        const rotated = rotation === 90 || rotation === 270;

        let bounds;

        /* Because image scaling is performed before rotation,
         * we must invert width & height and translate position so that tile rotation ends up correct
         */
        if (rotated) {
          bounds = new OpenSeadragon.Rect(
            position.x + (position.width - position.height) / 2,
            position.y - (position.width - position.height) / 2,
            position.height,
            position.width,
          );
        } else {
          bounds = new OpenSeadragon.Rect(
            position.x,
            position.y,
            position.width,
            position.height,
          );
        }

        this.viewer.addTiledImage({
          index: i,
          tileSource: tileSource,
          fitBounds: bounds,
          degrees: rotation,
        });
      });

      if (isTwoPageView && i % 2 !== 0) {
        group = this.svgNode.append('g').attr('class', 'page-group');
      }

      const currentOverlay = group
        .append('rect')
        .attr('x', position.x)
        .attr('y', position.y)
        .attr('width', position.width)
        .attr('height', position.height)
        .attr('class', 'tile');

      // Make custom borders if current layout is two-paged
      if (isTwoPageView) {
        if (i % 2 === 0 && i !== 0) {
          const noLeftStrokeStyle =
            Number(position.width * 2 + position.height) +
            ', ' +
            position.width * 2;
          currentOverlay.style('stroke-dasharray', noLeftStrokeStyle);
        } else if (i % 2 !== 0 && i !== 0) {
          const noRightStrokeStyle =
            position.width +
            ', ' +
            position.height +
            ', ' +
            Number(position.width * 2 + position.height);
          currentOverlay.style('stroke-dasharray', noRightStrokeStyle);
        }
      }

      const currentOverlayNode: SVGRectElement = currentOverlay.node();
      this.overlays[i] = currentOverlayNode;
    });

    const layout =
      this.viewerLayoutService.layout === ViewerLayout.ONE_PAGE ||
      !this.isManifestPaged
        ? ViewerLayout.ONE_PAGE
        : ViewerLayout.TWO_PAGE;
    this.canvasService.addAll(canvasRects, layout);
  }

  /**
   * Sets viewer size and opacity once the first canvas group has fully loaded
   */
  private initialCanvasGroupLoaded(): void {
    this.home();
    const isVisible =
      this.scrollDirectionService.isHorizontalScrollingDirection() &&
      this.modeService.mode !== ViewerMode.DASHBOARD;
    this.canvasGroupMask.initialize(
      this.canvasService.getCurrentCanvasGroupRect(),
      isVisible,
    );
    if (this.viewer) {
      d3.select(this.viewer.container.parentNode)
        .transition()
        .duration(ViewerOptions.transitions.OSDAnimationTime)
        .style('opacity', '1');
    }
  }

  private calculateCurrentCanvasGroup(center: Point) {
    if (center) {
      const currentCanvasGroupIndex =
        this.canvasService.findClosestCanvasGroupIndex(center);
      this.currentCanvasIndex.next(currentCanvasGroupIndex);
    }
  }

  /**
   * Single-click-handler
   * Single-click toggles between page/dashboard-mode if a page is hit
   */
  private singleClickHandler = (event: any) => {
    const tileIndex = this.getOverlayIndexFromClickEvent(event);
    const requestedCanvasGroupIndex =
      this.canvasService.findCanvasGroupByCanvasIndex(tileIndex);
    if (requestedCanvasGroupIndex !== -1) {
      this.canvasService.currentCanvasGroupIndex = requestedCanvasGroupIndex;
    } else {
      this.calculateCurrentCanvasGroup(this.viewer?.viewport.getCenter(true));
    }
    this.modeService.toggleMode();
  };

  /**
   * Double-click-handler
   * Double-click dashboard-mode should go to page-mode
   * Double-click page-mode should
   *    a) Zoom in if page is fitted vertically, or
   *    b) Fit vertically if page is already zoomed in
   */
  private dblClickHandler = (event: any) => {
    // Page is fitted vertically, so dbl-click zooms in
    if (this.modeService.mode === ViewerMode.PAGE) {
      this.modeService.mode = ViewerMode.PAGE_ZOOMED;
      this.zoomIn(ViewerOptions.zoom.dblClickZoomFactor, event.position);
    } else {
      this.modeService.mode = ViewerMode.PAGE;
      const canvasIndex: number = this.getOverlayIndexFromClickEvent(event);
      const requestedCanvasGroupIndex =
        this.canvasService.findCanvasGroupByCanvasIndex(canvasIndex);
      if (requestedCanvasGroupIndex >= 0) {
        this.canvasService.currentCanvasGroupIndex = requestedCanvasGroupIndex;
      } else {
        this.calculateCurrentCanvasGroup(this.viewer?.viewport.getCenter(true));
      }
    }
  };

  private dragEndHandler = (event: any): void => {
    if (this.dragStatus) {
      if (this.scrollDirectionService.isHorizontalScrollingDirection()) {
        this.swipeToCanvasGroup(event);
      } else {
        this.updateCurrentCanvasIndex(event);
      }
    }
    this.dragStatus = false;
  };

  private scrollHandler = (event: any) => {
    if (event.originalEvent.ctrlKey) {
      this.zoomOnScroll(event);
    } else {
      if (
        this.modeService.isPageZoomed() ||
        this.canvasService.isFitToEnabled()
      ) {
        this.panOnScroll(event);
      } else {
        this.navigateOnScroll(event);
      }
    }
  };

  private panHandler = (event: any) => {
    if (!this.dragStatus) {
      if (this.scrollDirectionService.isVerticalScrollingDirection()) {
        this.updateCurrentCanvasIndex(event);
      }
    }
  };

  private zoomHandler = (event: any) => {
    if (event.refPoint) {
      this.canvasService.resetFitTo();
    }
  };

  private pinchHandler = (event: any) => {
    this.pinchStatus.active = true;
    const zoomFactor = event.distance / event.lastDistance;
    // Pinch Out
    if (
      event.distance >
      event.lastDistance + ViewerOptions.zoom.pinchZoomThreshold
    ) {
      this.zoomInPinchGesture(event, zoomFactor);
      // Pinch In
    } else if (
      event.distance + ViewerOptions.zoom.pinchZoomThreshold <
      event.lastDistance
    ) {
      this.zoomOutPinchGesture(event, zoomFactor);
    }
  };

  private disableKeyDownHandler() {
    this.viewer.innerTracker.keyDownHandler = null;
  }

  private resetKeyDownHandler() {
    this.viewer.innerTracker.keyDownHandler = this.defaultKeyDownHandler;
  }

  private generateRandomId(prefix: string): string {
    const randomString = Math.random().toString(16).slice(2);
    return `${prefix}-${randomString}`;
  }

  /**
   * Switches to DASHBOARD-mode, repositions canvas group and removes max-width on viewer
   */
  private toggleToDashboard(): void {
    if (!this.canvasService.isCurrentCanvasGroupValid()) {
      return;
    }

    this.canvasService.resetFitTo();
    this.goToCanvasGroup(this.canvasService.currentCanvasGroupIndex, false);

    if (this.isCanvasMaskEnabled) {
      this.canvasGroupMask.hide();
    }

    this.zoomStrategy.setMinZoom(ViewerMode.DASHBOARD);
    this.goToHomeZoom();
  }

  /**
   * Switches to PAGE-mode, centers current canvas group and repositions other canvas groups
   */
  private toggleToPage(): void {
    if (!this.canvasService.isCurrentCanvasGroupValid()) {
      return;
    }

    this.goToCanvasGroup(this.canvasService.currentCanvasGroupIndex, false);

    if (this.isCanvasMaskEnabled) {
      this.canvasGroupMask.show();
    }

    this.zoomStrategy.setMinZoom(ViewerMode.PAGE);
    this.goToHomeZoom();
  }

  private zoomOnScroll(event: any): void {
    const zoomFactor = Math.pow(ViewerOptions.zoom.zoomFactor, event.scroll);
    // Scrolling up
    if (event.scroll > 0) {
      this.zoomInGesture(event.position, zoomFactor);
      // Scrolling down
    } else if (event.scroll < 0) {
      this.zoomOutGesture(event.position, zoomFactor);
    }
  }

  private panOnScroll(event: any): void {
    const scroll = event.scroll * -1;
    const y = scroll / this.getZoom() / this.scrollPanFactor;
    this.panBy({ x: 0, y });
  }

  private navigateOnScroll(event: any): void {
    this.manifest.viewingDirection === ViewingDirection.LTR
      ? event.scroll > 0
        ? this.goToPreviousCanvasGroup()
        : this.goToNextCanvasGroup()
      : event.scroll > 0
        ? this.goToNextCanvasGroup()
        : this.goToPreviousCanvasGroup();
  }

  private updateCurrentCanvasIndex(event: any): void {
    this.calculateCurrentCanvasGroup(event.center);
  }

  private swipeToCanvasGroup(e: any) {
    // Don't swipe on pinch actions
    if (this.pinchStatus.active) {
      return;
    }

    const speed: number = e.speed;
    const dragEndPosition = e.position;
    const canvasGroupRect: Rect =
      this.canvasService.getCurrentCanvasGroupRect();
    const viewportBounds: Rect = this.getViewportBounds();
    const direction: Direction = SwipeUtils.getSwipeDirection(
      this.dragStartPosition,
      dragEndPosition,
      this.modeService.isPageZoomed(),
    );
    const currentCanvasGroupIndex: number =
      this.canvasService.currentCanvasGroupIndex;
    const calculateNextCanvasGroupStrategy =
      CalculateNextCanvasGroupFactory.create(this.modeService.mode);

    let pannedPastSide: Side | null;
    let canvasGroupEndHitCountReached = false;
    if (this.modeService.isPageZoomed()) {
      pannedPastSide = SwipeUtils.getSideIfPanningPastEndOfCanvasGroup(
        canvasGroupRect,
        viewportBounds,
      );
      this.swipeDragEndCounter.addHit(
        pannedPastSide,
        direction,
        this.scrollDirectionService.scrollDirection,
      );
      canvasGroupEndHitCountReached =
        this.swipeDragEndCounter.hitCountReached();
    }

    const newCanvasGroupIndex = this.canvasService.constrainToRange(
      calculateNextCanvasGroupStrategy.calculateNextCanvasGroup({
        currentCanvasGroupCenter: this.currentCanvasIndex.getValue(),
        speed: speed,
        direction: direction,
        currentCanvasGroupIndex: currentCanvasGroupIndex,
        canvasGroupEndHitCountReached: canvasGroupEndHitCountReached,
        viewingDirection: this.manifest.viewingDirection,
        scrollDirection: this.scrollDirectionService.scrollDirection,
      }),
    );
    if (
      this.modeService.isDashBoard() ||
      this.modeService.isPage() ||
      (canvasGroupEndHitCountReached &&
        (direction === Direction.RIGHT || direction === Direction.LEFT))
    ) {
      this.goToCanvasGroup(newCanvasGroupIndex, false);
    }
  }

  private getViewportBounds(): Rect {
    return this.viewer?.viewport.getBounds();
  }

  private getOriginalTarget(event: any) {
    return event.originalTarget
      ? event.originalTarget
      : event.originalEvent.target;
  }

  private panBy(point: Point, immediately = false): void {
    this.viewer.viewport.panBy(point, immediately);
  }

  private panToCenter(): void {
    this.goToCanvasGroupStrategy.centerCurrentCanvas();
  }

  private rotateToRight() {
    this.rotation.next((this.rotation.getValue() + 90) % 360);
  }

  private showRotationIsNotSupportetMessage() {
    this.snackBar.open(this.intl.rotationIsNotSupported, undefined, {
      duration: 3000,
    });
  }

  private setOpacityOnPages(opacity: number): void {
    if (this.viewer) {
      const itemCount = this.viewer.world.getItemCount();
      for (let i = 0; i < itemCount; i++) {
        const item = this.viewer.world.getItemAt(i);
        item.setOpacity(opacity);
      }
    }
  }

  private updateFitTo(initialToggle = false): void {
    if (this.canvasService.isFitToWidthEnabled()) {
      this.zoomStrategy.fitToWidth();
      if (!initialToggle && this.shouldAdjustPosition()) {
        this.goToCanvasGroupStrategy.adjustPosition();
      }
    } else if (this.canvasService.isFitToHeightEnabled()) {
      this.zoomStrategy.fitToHeight();
      if (!initialToggle && this.shouldAdjustPosition()) {
        this.goToCanvasGroupStrategy.adjustPosition();
      }
    }
    this.updatePanningConstraints();
    this.constraintStrategy.constraintCanvas();
  }

  private shouldAdjustPosition(): boolean {
    return this.scrollDirectionService.isHorizontalScrollingDirection();
  }

  private enableHorizontalPanning(): void {
    this.viewer.panHorizontal = true;
  }

  private disableHorizontalPanning(): void {
    this.viewer.panHorizontal = false;
  }

  private enableVerticalPanning(): void {
    this.viewer.panVertical = true;
  }

  private disableVerticalPanning(): void {
    this.viewer.panVertical = false;
  }

  private unsubscribe() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }
}
