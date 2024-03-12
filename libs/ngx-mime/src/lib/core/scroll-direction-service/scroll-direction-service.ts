import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { MimeViewerConfig } from '../mime-viewer-config';
import { ScrollDirection } from '../models';

@Injectable()
export class ScrollDirectionService {
  private config!: MimeViewerConfig;
  private _scrollDirection!: ScrollDirection;
  private subject: BehaviorSubject<ScrollDirection>;

  constructor() {
    this.subject = new BehaviorSubject<ScrollDirection>(this._scrollDirection);
    this.scrollDirection = new MimeViewerConfig().initScrollDirection;
  }

  get onChange(): Observable<ScrollDirection> {
    return this.subject.asObservable().pipe(distinctUntilChanged());
  }

  get scrollDirection(): ScrollDirection {
    return this._scrollDirection;
  }

  set scrollDirection(scrollDirection: ScrollDirection) {
    this._scrollDirection = scrollDirection;
    this.change();
  }

  initialize(): void {
    this.scrollDirection = this.config?.initScrollDirection;
  }

  setConfig(config: MimeViewerConfig) {
    this.config = config;
  }

  setScrollDirection(scrollDirection: ScrollDirection) {
    this._scrollDirection = scrollDirection;
    this.change();
  }

  isHorizontalScrollingDirection(): boolean {
    return this.scrollDirection === ScrollDirection.HORIZONTAL;
  }

  isVerticalScrollingDirection(): boolean {
    return this.scrollDirection === ScrollDirection.VERTICAL;
  }

  private change() {
    this.subject.next(this._scrollDirection);
  }
}
