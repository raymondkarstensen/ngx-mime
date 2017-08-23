import { browser, element, by, ElementFinder, By } from 'protractor';
import { Utils } from '../helpers/utils';
import { promise, WebElement } from 'selenium-webdriver';

const utils = new Utils();
export class ViewerPage {
  private thumbStartPosition = {x: 600, y: 300};
  private pointerPosition1 = {x: 650, y: 275};
  private pointerPosition2 = {x: 750, y: 200};

  open() {
    return browser.get('');
  }

  contentsDialogButton() {
    return element(by.css('#contentsDialogButton'));
  }

  openSeadragonElement(): ElementFinder {
    const el = element(by.css('.openseadragon-container'));
    utils.waitForElement(el);
    return el;
  }

  /*
  Getters & Setters
   */
  setDefaultZoom(): promise.Promise<any> {
    return browser.executeScript('return window.openSeadragonViewer.viewport.goHome(true);');
  }

  getZoomLevel(): promise.Promise<number> {
    return browser.executeScript('return window.openSeadragonViewer.viewport.getZoom(true);');
  }

  setZoomLevel(level: number): promise.Promise<void> {
    return browser.executeScript('window.openSeadragonViewer.viewport.zoomTo(' + level + ');')
      .then(() => browser.sleep(1000));
  }

  getMinZoom(): promise.Promise<number> {
    return browser.executeScript('return window.openSeadragonViewer.viewport.getMinZoom();');
  }

  getMaxZoom(): promise.Promise<number> {
    return browser.executeScript('return window.openSeadragonViewer.viewport.getMaxZoom();');
  }

  /*
  Actions
   */
  pinchOut(): promise.Promise<void> {
    return browser.touchActions()
      .tapAndHold(this.thumbStartPosition)
      .tapAndHold(this.pointerPosition1)
      .move(this.pointerPosition2)
      .perform();
  }

  pinchIn(): promise.Promise<void> {
    return browser.touchActions()
      .tapAndHold(this.thumbStartPosition)
      .tapAndHold(this.pointerPosition2)
      .move(this.pointerPosition1)
      .perform();
  }

  zoomIn(): promise.Promise<boolean> {
    return this.getZoomLevel().then((currentZoomLevel: number) => {
      const newZoomLevel = currentZoomLevel + 0.2;
      return browser.executeScript('window.openSeadragonViewer.viewport.zoomTo(' + newZoomLevel + ');');
    });
  }

  zoomOut(): promise.Promise<boolean> {
    return this.getZoomLevel().then((currentZoomLevel: number) => {
      const newZoomLevel = currentZoomLevel - 0.2;
      return browser.executeScript('window.openSeadragonViewer.viewport.zoomTo(' + newZoomLevel + ');');
    });
  }

  dblClick(): promise.Promise<void> {
    return browser.findElement(By.css('.openseadragon-canvas')).then((canvas: WebElement) => {
      return browser.actions()
        .mouseMove(canvas)
        .doubleClick()
        .perform();
    });
  }

  clickZoomInButton() {
    return this.clickActionButton('Zoom in');
  }

  clickZoomOutButton() {
    return this.clickActionButton('Zoom out');
  }

  clickActionButton(actionButtonTitle: string) {
    const divs = element.all(by.css('.openseadragon-container div'));
    utils.waitForElement(divs.first());
    divs.each((div: ElementFinder, index: number) => {
      div.getAttribute('title').then((title: string) => {
        if (title === actionButtonTitle) {
          return divs.get(index).click();
        }
      });
    });
  }
}
