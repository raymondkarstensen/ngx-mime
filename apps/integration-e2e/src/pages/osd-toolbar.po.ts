import { Locator, Page } from 'playwright';

export class OsdToolbarPage {
  private readonly container: Locator;
  private readonly fabButton: Locator;
  private readonly fitToWidthButton: Locator;
  private readonly fitToHeightButton: Locator;

  constructor(page: Page) {
    this.container = page.locator('.osd-toolbar');
    this.fabButton = this.container.getByTestId('fabButton');
    this.fitToWidthButton = this.container.getByTestId(
      'ngx-mimeFitToWidthButton',
    );
    this.fitToHeightButton = this.container.getByTestId(
      'ngx-mimeFitToHeightButton',
    );
  }

  async clickFitToWidthButton(): Promise<void> {
    if (!(await this.isFabButtonOpen())) {
      await this.openFab();
    }
    await this.fitToWidthButton.click();
  }

  async clickFitToHeightButton(): Promise<void> {
    if (!(await this.isFabButtonOpen())) {
      await this.openFab();
    }
    await this.fitToHeightButton.click();
  }

  private openFab(): Promise<void> {
    return this.fabButton.click();
  }

  private async isFabButtonOpen(): Promise<boolean> {
    return (await this.fabButton.getAttribute('aria-expanded')) === 'true';
  }
}
