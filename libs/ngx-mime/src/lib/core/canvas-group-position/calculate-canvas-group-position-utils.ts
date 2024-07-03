import { Rect } from '../models';
import { Utils } from '../utils';

export const createCanvasRect = (
  rotation: number,
  tileSource: any,
  ignorePhysicalScale: boolean,
): Rect => {
  let rect = {};
  const scale = Utils.getScaleFactor(
    tileSource.service?.service?.physicalScale,
    ignorePhysicalScale,
  );
  if (rotation === 90 || rotation === 270) {
    rect = {
      height: Math.trunc(tileSource.width * scale),
      width: Math.trunc(tileSource.height * scale),
    };
  } else {
    rect = {
      height: Math.trunc(tileSource.height * scale),
      width: Math.trunc(tileSource.width * scale),
    };
  }
  return new Rect(rect);
};
