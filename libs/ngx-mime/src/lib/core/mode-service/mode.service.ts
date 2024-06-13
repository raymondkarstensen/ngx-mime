import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { MimeViewerConfig } from '../mime-viewer-config';
import { ModeChanges, ViewerMode } from '../models';

@Injectable()
export class ModeService {
  private config!: MimeViewerConfig;
  private _mode!: ViewerMode;
  private toggleModeSubject: BehaviorSubject<ModeChanges>;
  private modeChanges = new ModeChanges();

  constructor() {
    this.toggleModeSubject = new BehaviorSubject(new ModeChanges());
  }

  get onChange(): Observable<ModeChanges> {
    return this.toggleModeSubject
      .asObservable()
      .pipe(distinctUntilChanged(this.hasChanged));
  }

  set mode(mode: ViewerMode) {
    this._mode = mode;
    this.change();
  }

  get mode(): ViewerMode {
    return this._mode;
  }

  initialize(): void {
    this.mode = this.config?.initViewerMode;
  }

  destroy() {
    this.mode = this.config?.initViewerMode;
  }

  setConfig(config: MimeViewerConfig) {
    this.config = config;
  }

  toggleMode(): void {
    if (this.isDashBoard()) {
      this.mode = ViewerMode.PAGE;
    } else if (this.isPage() || this.isPageZoomed()) {
      this.mode = ViewerMode.DASHBOARD;
    }
  }

  isDashBoard(): boolean {
    return this.mode === ViewerMode.DASHBOARD;
  }

  isPage(): boolean {
    return this.mode === ViewerMode.PAGE;
  }

  isPageZoomed(): boolean {
    return this.mode === ViewerMode.PAGE_ZOOMED;
  }

  setViewerModeByZoomLevel(zoomLevel: number, homeZoomLevel: number): void {
    this.mode =
      zoomLevel > homeZoomLevel ? ViewerMode.PAGE_ZOOMED : ViewerMode.PAGE;
  }

  private change() {
    this.modeChanges.previousValue = this.modeChanges.currentValue;
    this.modeChanges.currentValue = this._mode;
    this.toggleModeSubject.next(this.modeChanges);
  }

  private hasChanged(previous: ModeChanges, current: ModeChanges): boolean {
    return current.previousValue === current.currentValue;
  }
}
