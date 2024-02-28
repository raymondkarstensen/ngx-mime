import { Locator, Page } from 'playwright';

export class ViewerHeaderPage {
  private readonly container: Locator;
  private readonly fitToWidthButton: Locator;
  private readonly fitToHeightButton: Locator;

  constructor(page: Page) {
    this.container = page.locator('.viewer-header-container');
    this.fitToWidthButton = this.container.getByTestId(
      'ngx-mimeFitToWidthButton'
    );
    this.fitToHeightButton = this.container.getByTestId(
      'ngx-mimeFitToHeightButton'
    );
  }

  async clickFitToWidthButton(): Promise<void> {
    await this.fitToWidthButton.click();
  }

  async clickFitToHeightButton(): Promise<void> {
    await this.fitToHeightButton.click();
  }
}
