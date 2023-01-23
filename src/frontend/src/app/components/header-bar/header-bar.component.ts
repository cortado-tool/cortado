import { VariantMinerComponent } from './../variant-miner/variant-miner.component';
import { VariantEditorComponent } from './../variant-editor/variant-editor.component';
import { ProcessTreeEditorComponent } from './../process-tree-editor/process-tree-editor.component';
import { BpmnEditorComponent } from './../bpmn-editor/bpmn-editor.component';
import { GoldenLayoutComponentService } from 'src/app/services/goldenLayoutService/golden-layout-component.service';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BackendService } from '../../services/backendService/backend.service';
import { ComponentItemConfig, LayoutManager, Side } from 'golden-layout';
import { VariantService } from 'src/app/services/variantService/variant.service';

@Component({
  selector: 'app-header-bar',
  templateUrl: './header-bar.component.html',
  styleUrls: ['./header-bar.component.css'],
})
export class HeaderBarComponent {
  @ViewChild('fileUploadEventLog') fileUploadEventLog: ElementRef;
  @ViewChild('fileUploadProcessTree') fileUploadProcessTree: ElementRef;

  public exportVariant = ExportVariant;
  showSettingsEvent: Subject<void> = new Subject<void>();

  constructor(
    private variantService: VariantService,
    private backendService: BackendService,
    private _elRef: ElementRef<HTMLElement>,
    private goldenLayoutComponentService: GoldenLayoutComponentService
  ) {}

  get element() {
    return this._elRef.nativeElement;
  }

  importEventLog(): void {
    this.fileUploadEventLog.nativeElement.click();
  }

  handleSelectedEventLogFile(e): void {
    const fileList: FileList = e.target.files;
    if (fileList.length > 0) {
      if (!environment.electron) {
        this.backendService.uploadEventLog(fileList[0]);
      } else {
        this.backendService.loadEventLogFromFilePath(fileList[0]['path']);
      }
    }
    // reset form
    this.fileUploadEventLog.nativeElement.value = '';
  }

  handleSelectedProcessTreeFile(e): void {
    const fileList: FileList = e.target.files;
    if (fileList.length > 0) {
      this.backendService.loadProcessTreeFromFilePath(fileList[0]['path']);
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

  openVariantEditor() {
    const componentID = VariantEditorComponent.componentName;

    const LocationSelectors: LayoutManager.LocationSelector[] = [
      {
        typeId: LayoutManager.LocationSelector.TypeId.FocusedStack,
        index: undefined,
      },
    ];

    const itemConfig: ComponentItemConfig = {
      id: componentID,
      type: 'component',
      title: 'Variant Editor',
      isClosable: true,
      reorderEnabled: true,
      header: {
        show: Side.left,
      },
      componentType: componentID,
      componentState: { cssParentClass: 'variant-editor-stack' },
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
}

export enum ExportVariant {
  ALL = 1,
  FITTING = 2,
  NONFITTING = 3,
  SELECTED = 4,
  DISPLAYED = 5,
}
