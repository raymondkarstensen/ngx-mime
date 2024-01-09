import { ViewerLayout } from '../models/viewer-layout';
import { Rect } from '../models/rect';
import { ScrollDirection } from '../models/scroll-direction';
import { Utils } from '../utils';
import { CanvasGroupPositionCriteria } from './calculate-canvas-group-position-strategy';

export const canvasRectFromCriteria = (
  rotation: number,
  criteria: CanvasGroupPositionCriteria,
  mainAxis: number,
  ignorePhysicalScale: boolean,
  scrollingDirection: ScrollDirection,
  even = false
) => {
  if (scrollingDirection === ScrollDirection.HORIZONTAL) {
    return horizontalCanvasRectFromCriteria(
      rotation,
      criteria,
      mainAxis,
      ignorePhysicalScale
    );
  } else {
    return verticalCanvasRectFromCriteria(
      rotation,
      criteria,
      mainAxis,
      ignorePhysicalScale,
      even
    );
  }
};

const horizontalCanvasRectFromCriteria = (
  rotation: number,
  criteria: CanvasGroupPositionCriteria,
  mainAxis: number,
  ignorePhysicalScale: boolean
) => {
  let rect = {};
  const scale = Utils.getScaleFactor(
    criteria.canvasSource.service?.service?.physicalScale,
    ignorePhysicalScale
  );
  if (rotation === 90 || rotation === 270) {
    rect = {
      height: Math.trunc(criteria.canvasSource.width * scale),
      width: Math.trunc(criteria.canvasSource.height * scale),
      x: mainAxis,
      y: Math.trunc((criteria.canvasSource.width * scale) / 2) * -1,
    };
  } else {
    rect = {
      height: Math.trunc(criteria.canvasSource.height * scale),
      width: Math.trunc(criteria.canvasSource.width * scale),
      x: mainAxis,
      y: Math.trunc((criteria.canvasSource.height * scale) / 2) * -1,
    };
  }
  return new Rect(rect);
};

const verticalCanvasRectFromCriteria = (
  rotation: number,
  criteria: CanvasGroupPositionCriteria,
  mainAxis: number,
  ignorePhysicalScale: boolean,
  even: boolean
): Rect => {
  let rect = {};
  const scale = Utils.getScaleFactor(
    criteria.canvasSource.service?.service?.physicalScale,
    ignorePhysicalScale
  );
  if (criteria.viewerLayout === ViewerLayout.ONE_PAGE) {
    return verticalCanvasRectFromCriteriaForOnePage(
      rotation,
      criteria,
      mainAxis,
      ignorePhysicalScale,
    );
  } else {
    return verticalCanvasRectFromCriteriaForTwoPage(
      rotation,
      criteria,
      mainAxis,
      ignorePhysicalScale,
      even
    );
  }
};

const verticalCanvasRectFromCriteriaForOnePage = (
  rotation: number,
  criteria: CanvasGroupPositionCriteria,
  mainAxis: number,
  ignorePhysicalScale: boolean,
) => {
  let rect = {};
  const scale = Utils.getScaleFactor(
    criteria.canvasSource.service?.service?.physicalScale,
    ignorePhysicalScale
  );
  if (rotation === 90 || rotation === 270) {
    rect = {
      width: Math.trunc(criteria.canvasSource.height * scale),
      height: Math.trunc(criteria.canvasSource.width * scale),
      x: Math.trunc((criteria.canvasSource.height * scale) / 2) * -1,
      y: mainAxis,
    };
  } else {
    rect = {
      width: Math.trunc(criteria.canvasSource.width * scale),
      height: Math.trunc(criteria.canvasSource.height * scale),
      x: Math.trunc((criteria.canvasSource.width * scale) / 2) * -1,
      y: mainAxis,
    };
  }
  return new Rect(rect);
};

const verticalCanvasRectFromCriteriaForTwoPage = (
  rotation: number,
  criteria: CanvasGroupPositionCriteria,
  mainAxis: number,
  ignorePhysicalScale: boolean,
  even: boolean
) => {
  let rect = {};
  const scale = Utils.getScaleFactor(
    criteria.canvasSource.service?.service?.physicalScale,
    ignorePhysicalScale
  );
  if (rotation === 90 || rotation === 270) {
    rect = {
      width: Math.trunc(criteria.canvasSource.height * scale),
      height: Math.trunc(criteria.canvasSource.width * scale),
      x: Math.trunc((criteria.canvasSource.height * scale) / 2) * -1,
      y: mainAxis,
    };
  } else {
    let x = criteria.previousCanvasGroupPosition
      ? Math.trunc((criteria.canvasSource.width * scale) / 2) * -1
      : 0;
    if (
      criteria.previousCanvasGroupPosition &&
      criteria.previousCanvasGroupPosition.y !== 0 &&
      !even
    ) {
      mainAxis = criteria.previousCanvasGroupPosition.y;
      x -= criteria.previousCanvasGroupPosition.x + x;
    }
    rect = {
      width: Math.trunc(criteria.canvasSource.width * scale),
      height: Math.trunc(criteria.canvasSource.height * scale),
      x: x,
      y: mainAxis,
    };
  }
  return new Rect(rect);
};
