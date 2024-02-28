import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/custom-world';

const zoomLevels = new Set();

When(
  'the user navigates between the pages',
  async function (this: CustomWorld) {
    for (let i = 0; i < 2; i++) {
      await this.viewerPage.slideToCanvasGroup(i);
      await this.animations.waitFor();
      zoomLevels.add(await this.viewerPage.getZoomLevel());
    }
  }
);

When('the user click the fit to width button', async function(this: CustomWorld) {
  if (await this.viewerPage.isPageMode()) {
    await this.osdToolbarPage.clickFitToWidthButton();
  } else {
    await this.viewerHeaderPage.clickFitToWidthButton();
  }
});

When('the user click the fit to height button', async function(this: CustomWorld) {
  if (await this.viewerPage.isPageMode()) {
    await this.osdToolbarPage.clickFitToHeightButton();
  } else {
    await this.viewerHeaderPage.clickFitToHeightButton();
  }
});

Then(
  "the current page's size should be zoomed to fill the viewer",
  async function (this: CustomWorld) {
    await this.animations.waitFor();
    expect(zoomLevels.size).toEqual(2);
  }
);

Then('the current page size should equal the viewport width', async function(this: CustomWorld) {
  await this.animations.waitFor();
  expect(await this.viewerPage.getZoomLevel()).toBeGreaterThan(await this.viewerPage.getHomeZoom());
  expect(await this.viewerPage.isCurrentCanvasEqualViewportWidth()).toEqual(true);
});

Then('the current page size should equal the viewport height', async function(this: CustomWorld) {
  await this.animations.waitFor();
  expect(await this.viewerPage.getZoomLevel()).toBeGreaterThan(await this.viewerPage.getHomeZoom());
  expect(await this.viewerPage.isCurrentCanvasEqualViewportHeight()).toEqual(true);
});

Then('should update the page size to fit to width when changing page', async function(this: CustomWorld) {
  await this.viewerPage.clickNextButton();
  await this.animations.waitFor();
  expect(await this.viewerPage.getZoomLevel()).toBeGreaterThan(await this.viewerPage.getHomeZoom());
  expect(await this.viewerPage.isCurrentCanvasEqualViewportWidth()).toEqual(true);
});

Then('should update the page size to fit to height when changing page', async function(this: CustomWorld) {
  await this.viewerPage.clickNextButton();
  await this.animations.waitFor();
  expect(await this.viewerPage.getZoomLevel()).toBeGreaterThan(await this.viewerPage.getHomeZoom());
  expect(await this.viewerPage.isCurrentCanvasEqualViewportHeight()).toEqual(true);
});
