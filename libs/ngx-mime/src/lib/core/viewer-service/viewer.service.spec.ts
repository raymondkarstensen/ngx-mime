import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ScrollDirectionService } from '../scroll-direction-service/scroll-direction-service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideAutoSpy } from 'jest-auto-spies';
import { testManifest } from '../../test/testManifest';
import { AltoService } from '../alto-service/alto.service';
import { ManifestBuilder } from '../builders/iiif/v2/manifest.builder';
import { CanvasService } from '../canvas-service/canvas-service';
import { ClickService } from '../click-service/click.service';
import { IiifContentSearchService } from '../iiif-content-search-service/iiif-content-search.service';
import { MimeViewerIntl } from '../intl';
import { MimeViewerConfig } from '../mime-viewer-config';
import { ModeService } from '../mode-service/mode.service';
import { Hit, SearchResult, ViewerMode } from '../models';
import { StyleService } from '../style-service/style.service';
import { ViewerLayoutService } from '../viewer-layout-service/viewer-layout-service';
import { ViewerService } from './viewer.service';

@Component({
  template: ` <div [id]="openseadragonId"></div> `,
})
class TestHostComponent {
  openseadragonId: string | null = null;
}

describe('ViewerService', () => {
  const config = new MimeViewerConfig();
  let snackBar: MatSnackBar;
  let hostFixture: ComponentFixture<TestHostComponent>;
  let viewerService: ViewerService;
  let canvasService: CanvasService;
  let modeService: ModeService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, MatSnackBarModule],
      declarations: [TestHostComponent],
      providers: [
        ViewerService,
        MimeViewerIntl,
        ScrollDirectionService,
        CanvasService,
        ModeService,
        provideAutoSpy(ClickService),
        provideAutoSpy(ViewerLayoutService, {
          observablePropsToSpyOn: ['onChange'],
        }),
        provideAutoSpy(IiifContentSearchService, {
          observablePropsToSpyOn: ['onSelected'],
        }),
        provideAutoSpy(StyleService, {
          observablePropsToSpyOn: ['onChange'],
        }),
        provideAutoSpy(AltoService, {
          observablePropsToSpyOn: ['onRecognizedTextContentModeChange$'],
        }),
      ],
    });

    viewerService = TestBed.inject(ViewerService);
    canvasService = TestBed.inject(CanvasService);
    modeService = TestBed.inject(ModeService);
    snackBar = TestBed.inject(MatSnackBar);
    hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.componentInstance.openseadragonId =
      viewerService.openseadragonId;
    hostFixture.detectChanges();
  });

  beforeEach((done) => {
    viewerService.setUpViewer(
      new ManifestBuilder(testManifest).build(),
      config,
    );

    viewerService.onOsdReadyChange.subscribe((isReady: boolean) => {
      if (isReady) {
        done();
      }
    });
  });

  afterEach(() => {
    viewerService.destroy();
  });

  it('should be created', () => {
    expect(viewerService).toBeTruthy();
  });

  it('should keep state of currentSearch on destroy when layoutSwitch = true', () => {
    viewerService.currentSearch = new SearchResult({
      q: 'Donald Duck',
      hits: new Array<Hit>(),
    });

    viewerService.destroy(true);

    expect(viewerService.currentSearch).not.toBeNull();
    expect(viewerService.currentSearch.q).toEqual('Donald Duck');
  });

  it('should set currentSearch to null on destroy', () => {
    viewerService.currentSearch = new SearchResult({
      q: 'Donald Duck',
      hits: new Array<Hit>(),
    });

    viewerService.destroy();

    expect(viewerService.currentSearch).toBeNull();
  });

  it('should keep state of rotation on destroy when layoutSwitch = true', () => {
    let rotation = 0;
    viewerService.onRotationChange.subscribe((serviceRotation: number) => {
      rotation = serviceRotation;
    });

    viewerService.rotate();
    viewerService.destroy(true);

    expect(rotation).toEqual(90);
  });

  it('should set rotation to 0 on destroy', () => {
    let rotation = 90;
    viewerService.onRotationChange.subscribe((serviceRotation: number) => {
      rotation = serviceRotation;
    });

    viewerService.rotate();
    viewerService.destroy(false);

    expect(rotation).toEqual(0);
  });

  it('should set viewer to null on destroy', () => {
    viewerService.destroy(false);

    expect(viewerService.getViewer()).toBeNull();
  });

  describe('rotate', () => {
    it('should rotate if using canvas', () => {
      viewerService.rotate();

      viewerService.onRotationChange.subscribe((rotation: number) => {
        if (rotation !== 0) {
          expect(rotation).toBe(90);
        }
      });
    });

    it('should show error message if not using canvas', () => {
      const openSpy = jest.spyOn(snackBar, 'open');
      const viewer = viewerService.getViewer();
      viewer.useCanvas = false;

      viewerService.rotate();

      expect(openSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('fit to', () => {
    beforeEach(() => {
      jest.spyOn(canvasService, 'resetFitTo').mockReturnValue();
      jest.spyOn(canvasService, 'isFitToEnabled').mockReturnValue(true);
      modeService.mode = ViewerMode.PAGE_ZOOMED;
    });

    describe('height', () => {
      it('should reset when OSD home button is clicked', () => {
        viewerService.home();

        expect(modeService.mode).toEqual(ViewerMode.PAGE);
        expect(canvasService.resetFitTo).toHaveBeenCalledTimes(1);
      });

      it('should not reset when ViewerMode is changed to Page mode', () => {
        modeService.mode = ViewerMode.PAGE;

        expect(modeService.mode).toEqual(ViewerMode.PAGE);
        expect(canvasService.resetFitTo).not.toHaveBeenCalled();
      });
    });

    describe('width', () => {
      it('should reset when OSD home button is clicked', () => {
        viewerService.home();

        expect(modeService.mode).toEqual(ViewerMode.PAGE);
        expect(canvasService.resetFitTo).toHaveBeenCalledTimes(1);
      });

      it('should not reset when ViewerMode is changed to Page mode', () => {
        modeService.mode = ViewerMode.PAGE;

        expect(modeService.mode).toEqual(ViewerMode.PAGE);
        expect(canvasService.resetFitTo).not.toHaveBeenCalled();
      });
    });
  });
});
