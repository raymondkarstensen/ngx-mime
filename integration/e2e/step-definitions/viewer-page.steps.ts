import { defineSupportCode } from 'cucumber';
import { expect } from '../helpers/chai-imports';
import { ViewerPage } from '../pages/viewer.po';

defineSupportCode(function ({ Given, Then }) {
  const page = new ViewerPage();

  Given(/^the viewer is opened with a publication$/, async () => {
    await page.open();
  });

  Then(/^the viewer should be displayed$/, async () => {
    expect((await page.openSeadragonElement().isDisplayed())).to.be.true;
  });
});
