import {
  AfterViewInit,
  ApplicationInitStatus,
  APP_INITIALIZER,
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { GoldenLayoutHostComponent } from './components/golden-layout-host/golden-layout-host.component';
import { DropZoneDirective } from './directives/drop-zone/drop-zone.directive';
import { GoldenLayoutComponentService } from './services/goldenLayoutService/golden-layout-component.service';
import * as d3 from 'd3';
import { EditorService } from './services/editorService/editor.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit, OnDestroy, OnInit {
  title = 'interactive-process-mining-angular-app';

  @ViewChild('goldenLayoutHost')
  private _goldenLayoutHostComponent: GoldenLayoutHostComponent;
  private _windowResizeListener = () => this.handleWindowResizeEvent();

  constructor(
    private goldenLayoutComponentService: GoldenLayoutComponentService,
    private monacoEditorService: EditorService,
    @Inject(APP_INITIALIZER) public appInit: ApplicationInitStatus
  ) {}

  ngOnInit(): void {
    this.monacoEditorService.load();
  }

  _sideBarWidth: number = 30;

  ngAfterViewInit() {
    globalThis.addEventListener('resize', this._windowResizeListener);
    this._goldenLayoutHostComponent.initializeLayout();
    this.goldenLayoutComponentService.goldenLayoutHostComponent =
      this._goldenLayoutHostComponent;
    setTimeout(() => this.resizeGoldenLayout(), 0);

    this.goldenLayoutComponentService.goldenLayoutHostComponent =
      this._goldenLayoutHostComponent;
  }

  // Put the dropzone in front if a File Drag enters
  @HostListener('window:dragenter', ['$event'])
  window_dragenter(event) {
    if ((event.dataTransfer.types as Array<string>).includes('Files')) {
      DropZoneDirective.windowDrag = true;
    }
  }

  // If the File Drag leaves the window, put the Dropzone back again
  @HostListener('window:dragleave', ['$event'])
  window_dragleave(event: DragEvent) {
    if (event.screenX === 0 && event.screenY === 0) {
      DropZoneDirective.windowDrag = false;
    }
  }

  ngOnDestroy() {
    globalThis.removeEventListener('resize', this._windowResizeListener);
  }

  private handleWindowResizeEvent() {
    this.resizeGoldenLayout();
  }

  private resizeGoldenLayout() {
    const bodyWidth = document.body.offsetWidth;
    const bodyHeight = document.body.offsetHeight;
    this._goldenLayoutHostComponent.setSize(bodyWidth, bodyHeight);
  }
}
