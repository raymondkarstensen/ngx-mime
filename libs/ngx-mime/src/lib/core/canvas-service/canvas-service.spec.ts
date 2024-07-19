import { TestBed } from '@angular/core/testing';
import d3 from 'd3';
import { provideAutoSpy, Spy } from 'jest-auto-spies';

import { CanvasService } from './canvas-service';
import { FitTo, Rect, Resource, ViewerLayout } from '../models';
import { ScrollDirectionService } from '../scroll-direction-service/scroll-direction-service';
import { ViewerLayoutService } from '../viewer-layout-service/viewer-layout-service';

describe('CanvasService', () => {
  let canvasService: CanvasService;
  let viewerLayoutServiceSpy: Spy<ViewerLayoutService>;

  beforeEach(() => {
    const canvases: Rect[] = [];
    const tileSources: Resource[] = [];
    for (let i = 0; i < 100; i++) {
      canvases.push(new Rect());
      tileSources.push({
        id: 'id' + i,
        height: 100,
        width: 100,
        type: 'image',
        tileOverlap: 0,
      });
    }

    TestBed.configureTestingModule({
      providers: [
        CanvasService,
        ScrollDirectionService,
        provideAutoSpy(ViewerLayoutService, {
          gettersToSpyOn: ['layout'],
        }),
      ],
    });
    canvasService = TestBed.inject(CanvasService);
    viewerLayoutServiceSpy = TestBed.inject(
      ViewerLayoutService,
    ) as Spy<ViewerLayoutService>;

    jest.spyOn(canvasService as any, 'createOverlay').mockImplementation();
    viewerLayoutServiceSpy.accessorSpies.getters.layout.mockReturnValue(
      ViewerLayout.ONE_PAGE,
    );

    canvasService.setSvgNode(d3.create('svg'));
    canvasService.addTileSources(tileSources);
    canvasService.updateViewer();
  });

  it('should return true when requested canvas group index is within bounds', () => {
    expect(canvasService.isCanvasGroupWithinRange(0)).toBe(true);
    expect(canvasService.isCanvasGroupWithinRange(10)).toBe(true);
    expect(canvasService.isCanvasGroupWithinRange(99)).toBe(true);
  });

  it('should return false when requested canvas group index is outside bounds', () => {
    expect(canvasService.isCanvasGroupWithinRange(-1)).toBe(false);
    expect(canvasService.isCanvasGroupWithinRange(100)).toBe(false);
    expect(canvasService.isCanvasGroupWithinRange(101)).toBe(false);
    expect(canvasService.isCanvasGroupWithinRange(1000)).toBe(false);
  });

  it('should set canvas group index', () => {
    canvasService.currentCanvasGroupIndex = 0;
    expect(canvasService.currentCanvasGroupIndex).toBe(0);
    canvasService.currentCanvasGroupIndex = 99;
    expect(canvasService.currentCanvasGroupIndex).toBe(99);
  });

  it('should not set canvas group index if outside bounds', () => {
    canvasService.currentCanvasGroupIndex = 76;

    canvasService.currentCanvasGroupIndex = -2;
    expect(canvasService.currentCanvasGroupIndex).toBe(76);

    canvasService.currentCanvasGroupIndex = 100;
    expect(canvasService.currentCanvasGroupIndex).toBe(76);

    canvasService.currentCanvasGroupIndex = 101;
    expect(canvasService.currentCanvasGroupIndex).toBe(76);

    canvasService.currentCanvasGroupIndex = 176;
    expect(canvasService.currentCanvasGroupIndex).toBe(76);
  });

  it('should get next canvas group index', () => {
    let currentCanvasGroup = (canvasService.currentCanvasGroupIndex = 0);
    expect(canvasService.getNextCanvasGroupIndex()).toBe(
      currentCanvasGroup + 1,
    );

    currentCanvasGroup = canvasService.currentCanvasGroupIndex = 98;
    expect(canvasService.getNextCanvasGroupIndex()).toBe(
      currentCanvasGroup + 1,
    );
  });

  it('should get previous canvas group index', () => {
    let currentCanvasGroup = (canvasService.currentCanvasGroupIndex = 2);
    expect(canvasService.getPrevCanvasGroupIndex()).toBe(
      currentCanvasGroup - 1,
    );

    currentCanvasGroup = canvasService.currentCanvasGroupIndex = 1;
    expect(canvasService.getPrevCanvasGroupIndex()).toBe(
      currentCanvasGroup - 1,
    );
  });

  it('should return -1 when next canvas group index is out of bounds', () => {
    canvasService.currentCanvasGroupIndex = 99;
    expect(canvasService.getNextCanvasGroupIndex()).toBe(-1);
  });

  it('should return -1 when previous canvas group index is out of bounds', () => {
    canvasService.currentCanvasGroupIndex = 0;
    expect(canvasService.getPrevCanvasGroupIndex()).toBe(-1);
  });

  it('should return max canvas group index when next canvas group index is larger than max', () => {
    let newCanvasGroupIndex = canvasService.constrainToRange(101);
    expect(newCanvasGroupIndex).toBe(99);

    newCanvasGroupIndex = canvasService.constrainToRange(110);
    expect(newCanvasGroupIndex).toBe(99);
  });

  it('should not return canvas group index lower than 0', () => {
    let newCanvasGroupIndex = canvasService.constrainToRange(0);
    expect(newCanvasGroupIndex).toBe(0);

    newCanvasGroupIndex = canvasService.constrainToRange(-1);
    expect(newCanvasGroupIndex).toBe(0);

    newCanvasGroupIndex = canvasService.constrainToRange(-10);
    expect(newCanvasGroupIndex).toBe(0);
  });

  it('should return 1 if canvas group is empty', () => {
    const canvasGroupLabel = canvasService.getCanvasGroupLabel(0);
    expect(canvasGroupLabel).toBe('1');
  });

  describe('toggleFitToHeight', () => {
    beforeEach(() => {
      jest.spyOn(canvasService, 'resetFitTo').mockReturnValue();
      jest.spyOn(canvasService.fitTo$, 'next').mockReturnValue();
    });

    it('should reset fitTo when fit to height is already enabled', () => {
      jest.spyOn(canvasService, 'isFitToHeightEnabled').mockReturnValue(true);

      canvasService.toggleFitToHeight();

      expect(canvasService.resetFitTo).toHaveBeenCalledTimes(1);
    });

    it('should set fitTo to HEIGHT when fit to height is not enabled', () => {
      jest.spyOn(canvasService, 'isFitToHeightEnabled').mockReturnValue(false);

      canvasService.toggleFitToHeight();

      expect(canvasService.fitTo$.next).toHaveBeenCalledWith(FitTo.HEIGHT);
    });
  });

  describe('toggleFitToWidth', () => {
    beforeEach(() => {
      jest.spyOn(canvasService, 'resetFitTo').mockReturnValue();
      jest.spyOn(canvasService.fitTo$, 'next').mockReturnValue();
    });

    it('should reset fitTo when fit to width is already enabled', () => {
      jest.spyOn(canvasService, 'isFitToWidthEnabled').mockReturnValue(true);

      canvasService.toggleFitToWidth();

      expect(canvasService.resetFitTo).toHaveBeenCalledTimes(1);
    });

    it('should set fitTo to WIDTH when fit to width is not enabled', () => {
      jest.spyOn(canvasService, 'isFitToWidthEnabled').mockReturnValue(false);

      canvasService.toggleFitToWidth();

      expect(canvasService.fitTo$.next).toHaveBeenCalledWith(FitTo.WIDTH);
    });
  });

  describe('resetFitTo', () => {
    beforeEach(() => {
      jest.spyOn(canvasService.fitTo$, 'next').mockReturnValue();
    });

    it('should set fitTo to NONE when fitTo is enabled', () => {
      jest.spyOn(canvasService, 'isFitToEnabled').mockReturnValue(true);

      canvasService.resetFitTo();

      expect(canvasService.fitTo$.next).toHaveBeenCalledWith(FitTo.NONE);
    });

    it('should do nothing when fitTo is not enabled', () => {
      jest.spyOn(canvasService, 'isFitToEnabled').mockReturnValue(false);

      canvasService.resetFitTo();

      expect(canvasService.fitTo$.next).not.toHaveBeenCalled();
    });
  });
});
