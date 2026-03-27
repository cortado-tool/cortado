import { VariantMinerComponent } from './../variant-miner/variant-miner.component';
import { VariantModelerComponent } from './../variant-modeler/variant-modeler.component';
import { ProcessTreeEditorComponent } from './../process-tree-editor/process-tree-editor.component';
import { BpmnEditorComponent } from './../bpmn-editor/bpmn-editor.component';
import { GoldenLayoutComponentService } from 'src/app/services/goldenLayoutService/golden-layout-component.service';
import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BackendService } from '../../services/backendService/backend.service';
import { ComponentItemConfig, LayoutManager, Side } from 'golden-layout';
import { VariantService } from 'src/app/services/variantService/variant.service';
import { ProjectService } from 'src/app/services/projectService/project.service';
import { takeUntil } from 'rxjs/operators';
import { Modal } from 'bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoadingOverlayService } from 'src/app/services/loadingOverlayService/loading-overlay.service';
import { DocumentationService } from '../documentation/documentation.service';
import { VariantViewModeService } from 'src/app/services/viewModeServices/variant-view-mode.service';
import { ViewMode } from 'src/app/objects/ViewMode';
import { LogExportService } from 'src/app/services/logExportService/log-export.service';
import { VariantQueryModelerComponent } from '../variant-query-modeler/variant-query-modeler.component';

@Component({
  selector: 'app-header-bar',
  templateUrl: './header-bar.component.html',
  styleUrls: ['./header-bar.component.css'],
})
export class HeaderBarComponent implements OnDestroy {
  @ViewChild('fileUploadEventLog') fileUploadEventLog: ElementRef;
  @ViewChild('fileUploadProcessTree') fileUploadProcessTree: ElementRef;
  @ViewChild('fileUploadProject') fileUploadProject: ElementRef;
  @ViewChild('fileUploadEventLogRetry') fileUploadEventLogRetry: ElementRef;
  @ViewChild('eventLogSelectionRetryModal')
  eventLogSelectionRetryModal: ElementRef;

  public exportVariant = ExportVariant;
  showSettingsEvent: Subject<void> = new Subject<void>();

  public oldEventLogPath: string;

  private _destroy$ = new Subject();

  constructor(
    public variantService: VariantService,
    private backendService: BackendService,
    private projectService: ProjectService,
    public variantViewModeService: VariantViewModeService,
    private modalService: NgbModal,
    private loadingOverlayService: LoadingOverlayService,
    private _elRef: ElementRef<HTMLElement>,
    private goldenLayoutComponentService: GoldenLayoutComponentService,
    public documentationService: DocumentationService,
    private logExportService: LogExportService
  ) {
    this.backendService.retryEventLogSelection
      .pipe(takeUntil(this._destroy$))
      .subscribe((oldPath: string) => {
        this.oldEventLogPath = oldPath;
        this.modalService.open(this.eventLogSelectionRetryModal);
      });
  }

  public VM = ViewMode;

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  get element() {
    return this._elRef.nativeElement;
  }

  importEventLog(): void {
    this.fileUploadEventLog.nativeElement.click();
  }

  handleSelectedEventLogFile(e, isRetry = false): void {
    const fileList: FileList = e.target.files;
    if (fileList.length > 0) {
      const backendCall = !environment.electron
        ? this.backendService.uploadEventLog(fileList[0])
        : this.backendService.loadEventLogFromFilePath(fileList[0]['path']);
      this.loadingOverlayService.showLoader(
        'Importing event log (for large logs this can take up to several minutes)'
      );
      backendCall.subscribe(() => {
        this.loadingOverlayService.hideLoader();
      });
    }

    // reset form
    if (isRetry) this.fileUploadEventLogRetry.nativeElement.value = '';
    else this.fileUploadEventLog.nativeElement.value = '';
  }

  handleSelectedProcessTreeFile(e): void {
    const fileList: FileList = e.target.files;
    if (fileList.length > 0) {
      if (environment.electron) {
        this.backendService.loadProcessTreeFromFilePath(fileList[0]['path']);
      } else {
        this.backendService.loadProcessTreeFromFile(fileList[0]);
      }
    }
    this.fileUploadProcessTree.nativeElement.value = '';
  }

  exportTreeAsPTML(): void {
    this.backendService.downloadCurrentTreeAsPTML();
  }

  exportTreeAsPNML(): void {
    this.backendService.downloadCurrentTreeAsPNML();
  }

  exportTreeAsBPMN(): void {
    this.backendService.downloadCurrentTreeAsBPMN();
  }

  importTreeFromPTML(): void {
    this.fileUploadProcessTree.nativeElement.click();
  }

  showSettingsDialog(): void {
    this.showSettingsEvent.next();
  }

  showDocumentationDialog(): void {
    this.documentationService.showDocumentationDialog();
  }

  showLogExporter(): void {
    this.logExportService.showLogExportDialog();
  }

  /* Handle Electron Window Behavior via IPC messages
  toggleHide(): void{
    this.ipc.send('maximize-window')
  }

  toggleMaximization(): void {
    this.ipc.send('maximize-window')
  }

  closeApp(): void {
    this.ipc.send('maximize-window')
  }
  */

  openBPMNViewer() {
    const componentID = BpmnEditorComponent.componentName;
    const parentComponentID = ProcessTreeEditorComponent.componentName;

    const LocationSelectors: LayoutManager.LocationSelector[] = [
      {
        typeId: LayoutManager.LocationSelector.TypeId.FocusedStack,
        index: undefined,
      },
    ];

    const itemConfig: ComponentItemConfig = {
      id: componentID,
      type: 'component',
      title: 'BPMN Editor',
      isClosable: true,
      reorderEnabled: true,
      header: {
        show: Side.left,
      },
      componentType: componentID,
      componentState: { cssParentClass: 'bpmn-viewer-stack' },
    };

    this.goldenLayoutComponentService.openWindow(
      componentID,
      parentComponentID,
      LocationSelectors,
      itemConfig
    );
  }

  openProcessTreeEditor() {
    const componentID = ProcessTreeEditorComponent.componentName;

    const LocationSelectors: LayoutManager.LocationSelector[] = [
      {
        typeId: LayoutManager.LocationSelector.TypeId.FirstRow,
        index: undefined,
      },
    ];

    const itemConfig: ComponentItemConfig = {
      id: componentID,
      type: 'component',
      title: 'BPMN Editor',
      isClosable: false,
      reorderEnabled: false,
      header: {
        show: Side.left,
      },
      componentType: componentID,
      componentState: { cssParentClass: 'process-tree-editor-stack' },
    };

    this.goldenLayoutComponentService.openWindow(
      componentID,
      null,
      LocationSelectors,
      itemConfig
    );
  }

  openVariantMiner() {
    const componentID = VariantMinerComponent.componentName;
    const parentComponentID = ProcessTreeEditorComponent.componentName;

    const LocationSelectors: LayoutManager.LocationSelector[] = [
      {
        typeId: LayoutManager.LocationSelector.TypeId.FocusedStack,
        index: undefined,
      },
    ];

    const itemConfig: ComponentItemConfig = {
      id: componentID,
      type: 'component',
      title: 'Variant Miner',
      isClosable: true,
      reorderEnabled: true,
      header: {
        show: Side.left,
      },
      componentType: componentID,
    };

    this.goldenLayoutComponentService.openWindow(
      componentID,
      parentComponentID,
      LocationSelectors,
      itemConfig
    );
  }

  openVariantModeler() {
    const componentID = VariantModelerComponent.componentName;

    const LocationSelectors: LayoutManager.LocationSelector[] = [
      {
        typeId: LayoutManager.LocationSelector.TypeId.FocusedStack,
        index: undefined,
      },
    ];

    const itemConfig: ComponentItemConfig = {
      id: componentID,
      type: 'component',
      title: 'Variant Modeler',
      isClosable: true,
      reorderEnabled: true,
      header: {
        show: Side.left,
      },
      componentType: componentID,
      componentState: { cssParentClass: 'variant-modeler-stack' },
    };

    this.goldenLayoutComponentService.openWindow(
      componentID,
      ProcessTreeEditorComponent.componentName,
      LocationSelectors,
      itemConfig
    );
  }

  openVariantQueryModeler() {
    const componentID = VariantQueryModelerComponent.componentName;

    const LocationSelectors: LayoutManager.LocationSelector[] = [
      {
        typeId: LayoutManager.LocationSelector.TypeId.FocusedStack,
        index: undefined,
      },
    ];

    const itemConfig: ComponentItemConfig = {
      id: componentID,
      type: 'component',
      title: 'Variant Query Modeler',
      isClosable: true,
      reorderEnabled: true,
      header: {
        show: Side.left,
      },
      componentType: componentID,
      componentState: { cssParentClass: 'variant-modeler-stack' },
    };

    this.goldenLayoutComponentService.openWindow(
      componentID,
      ProcessTreeEditorComponent.componentName,
      LocationSelectors,
      itemConfig
    );
  }

  exportVariantsAsLog(type: ExportVariant) {
    const variant = this.variantService.variants;
    switch (type) {
      case ExportVariant.ALL:
        this.backendService.exportEventLogFromLog(variant.map((v) => v.bid));
        break;

      case ExportVariant.FITTING:
        this.backendService.exportEventLogFromLog(
          variant
            .filter((v) => {
              return v.deviations == 0;
            })
            .map((v) => v.bid)
        );
        break;

      case ExportVariant.NONFITTING:
        this.backendService.exportEventLogFromLog(
          variant
            .filter((v) => {
              return v.deviations > 0;
            })
            .map((v) => v.bid)
        );
        break;

      case ExportVariant.SELECTED:
        this.backendService.exportEventLogFromLog(
          variant
            .filter((v) => {
              return v.isSelected;
            })
            .map((v) => v.bid)
        );
        break;

      case ExportVariant.DISPLAYED:
        this.backendService.exportEventLogFromLog(
          variant
            .filter((v) => {
              return v.isDisplayed;
            })
            .map((v) => v.bid)
        );
        break;
    }
  }

  public loadProject() {
    this.fileUploadProject.nativeElement.click();
  }

  public saveProject() {
    this.projectService.saveProject();
  }

  handleSelectedProjectFile(e): void {
    const fileList: FileList = e.target.files;
    if (fileList.length > 0) {
      this.projectService.loadProjectFromFile(fileList[0]);
    }
    // reset form
    this.fileUploadProject.nativeElement.value = '';
  }
}

export enum ExportVariant {
  ALL = 1,
  FITTING = 2,
  NONFITTING = 3,
  SELECTED = 4,
  DISPLAYED = 5,
}
