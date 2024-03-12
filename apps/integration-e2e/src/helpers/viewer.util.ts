import { Page } from 'playwright';

export class ViewerUtil {
  constructor(private page: Page) {}

  static getFirstPartOfCurrentCanvasGroupLabel(canvasGroupLabel: string): string | undefined {
    return canvasGroupLabel.split('-').at(0);
  }

  static getSecondPartOfCurrentCanvasGroupLabel(canvasGroupLabel: string): string | undefined {
    return canvasGroupLabel.split('-').at(1);
  }
}
