import { Rect } from '../models';
import { Resource, Service } from '../models/manifest';
import { createCanvasRect } from './calculate-canvas-group-position-utils';

describe('createCanvasRect', () => {
  const tileSource = new Resource({
    id: 'fakeId',
    width: 100,
    height: 200,
    service: new Service({
      service: new Service({
        width: 100,
        height: 100,
        physicalScale: 0.0025,
      }),
    }),
  });

  describe('using physicalScale', () => {
    it('should return Rect', () => {
      const canvasRect = createCanvasRect(0, tileSource, false);

      expect(canvasRect).toEqual(new Rect({ width: 100, height: 200 }));
    });

    it('should rotate 90 degrees', () => {
      const canvasRect = createCanvasRect(90, tileSource, false);

      expect(canvasRect).toEqual(new Rect({ width: 200, height: 100 }));
    });

    it('should rotate 180 degrees', () => {
      const canvasRect = createCanvasRect(180, tileSource, false);

      expect(canvasRect).toEqual(new Rect({ width: 100, height: 200 }));
    });

    it('should rotate 270 degrees', () => {
      const canvasRect = createCanvasRect(270, tileSource, false);

      expect(canvasRect).toEqual(new Rect({ width: 200, height: 100 }));
    });
    it('should rotate 360 degrees', () => {
      const canvasRect = createCanvasRect(360, tileSource, false);

      expect(canvasRect).toEqual(new Rect({ width: 100, height: 200 }));
    });
  });
  describe('ignoring physicalScale', () => {
    it('should return Rect', () => {
      const canvasRect = createCanvasRect(0, tileSource, true);

      expect(canvasRect).toEqual(new Rect({ width: 100, height: 200 }));
    });

    it('should rotate 90 degrees', () => {
      const canvasRect = createCanvasRect(90, tileSource, true);

      expect(canvasRect).toEqual(new Rect({ width: 200, height: 100 }));
    });

    it('should rotate 180 degrees', () => {
      const canvasRect = createCanvasRect(180, tileSource, true);

      expect(canvasRect).toEqual(new Rect({ width: 100, height: 200 }));
    });

    it('should rotate 270 degrees', () => {
      const canvasRect = createCanvasRect(270, tileSource, true);

      expect(canvasRect).toEqual(new Rect({ width: 200, height: 100 }));
    });
    it('should rotate 360 degrees', () => {
      const canvasRect = createCanvasRect(360, tileSource, true);

      expect(canvasRect).toEqual(new Rect({ width: 100, height: 200 }));
    });
  });
});
