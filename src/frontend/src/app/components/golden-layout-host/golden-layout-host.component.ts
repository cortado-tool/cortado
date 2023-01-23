import { VariantMinerComponent } from './../variant-miner/variant-miner.component';
import { GoldenLayoutDummyComponent } from './golden-layout-dummy/golden-layout-dummy.component';
import {
  Component,
  ComponentRef,
  ElementRef,
  OnDestroy,
  Renderer2,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  ComponentContainer,
  GoldenLayout,
  LogicalZIndex,
  ResolvedComponentItemConfig,
  Stack,
} from 'golden-layout';

import { baseLayout } from './LayoutTemplates/golden-layout-cortado-base';
import { ProcessTreeEditorComponent } from '../process-tree-editor/process-tree-editor.component';
import { VariantExplorerComponent } from '../variant-explorer/variant-explorer.component';
import { ActivityOverviewComponent } from '../activity-overview/activity-overview.component';
import { SubvariantExplorerComponent } from '../variant-explorer/subvariant-explorer/subvariant-explorer.component';
import {
  findContentItemByUniqueID,
  GoldenLayoutComponentService,
} from '../../services/goldenLayoutService/golden-layout-component.service';
import { BpmnEditorComponent } from '../bpmn-editor/bpmn-editor.component';
import { VariantEditorComponent } from '../variant-editor/variant-editor.component';
import { InfoBoxComponent } from '../info-box/info-box.component';
import { LayoutChangeDirective } from 'src/app/directives/layout-change/layout-change.directive';

import { ModelPerformanceComponent } from '../performance/performance.component';
import { VariantPerformanceComponent } from '../variant-performance/variant-performance.component';
import { ConformanceTabComponent } from '../conformance-tab/conformance-tab.component';
import { ViewMode } from 'src/app/objects/ViewMode';
import { VariantViewModeService } from 'src/app/services/viewModeServices/variant-view-mode.service';
@Component({
  selector: 'app-golden-layout-host',
  templateUrl: './golden-layout-host.component.html',
  styleUrls: ['./golden-layout-host.component.css'],
})
export class GoldenLayoutHostComponent implements OnDestroy {
  private _goldenLayout: GoldenLayout;
  private _goldenLayoutElement: HTMLElement;
  private _componentRefMap = new Map<
    ComponentContainer,
    ComponentRef<LayoutChangeDirective>
  >();

  private _collapsedComponentContainers: Set<ComponentContainer> =
    new Set<ComponentContainer>();
  private _goldenLayoutBoundingClientRect: DOMRect = new DOMRect();

  private _goldenLayoutBindComponentEventListener = (
    container: ComponentContainer,
    itemConfig: ResolvedComponentItemConfig
  ) => this.handleBindComponentEvent(container, itemConfig);

  private _goldenLayoutUnbindComponentEventListener = (
    container: ComponentContainer
  ) => this.handleUnbindComponentEvent(container);

  @ViewChild('componentViewContainer', { read: ViewContainerRef, static: true })
  private _componentViewContainerRef: ViewContainerRef;

  get goldenLayout() {
    return this._goldenLayout;
  }

  constructor(
    private _elRef: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private goldenLayoutComponentService: GoldenLayoutComponentService,
    private variantViewModeService: VariantViewModeService
  ) {
    // Get the Layout Host Component
    this._goldenLayoutElement = this._elRef.nativeElement;

    // Register Components to the Layout Template Host
    this.goldenLayoutComponentService.registerComponentType(
      ProcessTreeEditorComponent.componentName,
      ProcessTreeEditorComponent
    );
    this.goldenLayoutComponentService.registerComponentType(
      ActivityOverviewComponent.componentName,
      ActivityOverviewComponent
    );

    this.goldenLayoutComponentService.registerComponentType(
      VariantPerformanceComponent.componentName,
      VariantPerformanceComponent
    );

    this.goldenLayoutComponentService.registerComponentType(
      ModelPerformanceComponent.componentName,
      ModelPerformanceComponent
    );

    this.goldenLayoutComponentService.registerComponentType(
      ConformanceTabComponent.componentName,
      ConformanceTabComponent
    );

    this.goldenLayoutComponentService.registerComponentType(
      InfoBoxComponent.componentName,
      InfoBoxComponent
    );
    this.goldenLayoutComponentService.registerComponentType(
      SubvariantExplorerComponent.componentName,
      SubvariantExplorerComponent
    );

    this.goldenLayoutComponentService.registerComponentType(
      VariantMinerComponent.componentName,
      VariantMinerComponent
    );

    this.goldenLayoutComponentService.registerComponentType(
      VariantExplorerComponent.componentName,
      VariantExplorerComponent
    );

    this.goldenLayoutComponentService.registerComponentType(
      BpmnEditorComponent.componentName,
      BpmnEditorComponent
    );

    this.goldenLayoutComponentService.registerComponentType(
      GoldenLayoutDummyComponent.componentName,
      GoldenLayoutDummyComponent
    );

    this.goldenLayoutComponentService.registerComponentType(
      VariantEditorComponent.componentName,
      VariantEditorComponent
    );

    this._goldenLayout = new GoldenLayout(
      this._goldenLayoutElement,
      this._goldenLayoutBindComponentEventListener,
      this._goldenLayoutUnbindComponentEventListener
    );

    this._goldenLayout.beforeVirtualRectingEvent = () =>
      this.handleBeforeVirtualRectingEvent();

    this.goldenLayoutComponentService.goldenLayout = this.goldenLayout;
    this.goldenLayoutComponentService.goldenLayoutHostComponent = this;

    this.variantViewModeService.viewMode$.subscribe((viewMode) => {
      this.reactOnViewModeChange(viewMode);
    });
  }

  initializeLayout() {
    // Start rendering the Template
    this.goldenLayout.loadLayout(baseLayout);
  }

  ngOnDestroy() {
    this._goldenLayout.destroy();
  }

  setSize(width: number, height: number) {
    this._goldenLayout.setSize(width, height);
  }

  getComponentRef(container: ComponentContainer) {
    return this._componentRefMap.get(container);
  }

  private handleBindComponentEvent(
    container: ComponentContainer,
    itemConfig: ResolvedComponentItemConfig
  ): ComponentContainer.BindableComponent {
    const componentType = itemConfig.componentType;
    const componentRef = this.goldenLayoutComponentService.createComponent(
      componentType,
      container
    );

    const component = componentRef.instance;
    this._componentRefMap.set(container, componentRef);

    container.virtualRectingRequiredEvent = (container, width, height) =>
      this.handleContainerVirtualRectingRequiredEvent(container, width, height);
    container.virtualVisibilityChangeRequiredEvent = (container, visible) =>
      this.handleContainerVisibilityChangeRequiredEvent(container, visible);
    container.virtualZIndexChangeRequiredEvent = (
      container,
      logicalZIndex,
      defaultZIndex
    ) =>
      this.handleContainerVirtualZIndexChangeRequiredEvent(
        container,
        logicalZIndex,
        defaultZIndex
      );

    if (itemConfig.componentState['cssParentClass']) {
      this.renderer.addClass(
        container.parent.parentItem.element,
        itemConfig.componentState['cssParentClass']
      );
    }

    if (itemConfig.componentState['cssContainerClass']) {
      this.renderer.addClass(
        container.element,
        itemConfig.componentState['cssContainerClass']
      );
    }

    this._componentViewContainerRef.insert(componentRef.hostView);

    return {
      component,
      virtual: true,
    };
  }

  private handleUnbindComponentEvent(container: ComponentContainer) {
    const componentRef = this._componentRefMap.get(container);
    if (componentRef === undefined) {
      throw new Error('Could not unbind component. Container not found');
    }
    this._componentRefMap.delete(container);

    const hostView = componentRef.hostView;
    const viewRefIndex = this._componentViewContainerRef.indexOf(hostView);
    if (viewRefIndex < 0) {
      throw new Error('Could not unbind component. ViewRef not found');
    }

    this._componentViewContainerRef.remove(viewRefIndex);
    componentRef.destroy();
  }

  private handleBeforeVirtualRectingEvent() {
    this._goldenLayoutBoundingClientRect =
      this._goldenLayoutElement.getBoundingClientRect();
  }

  private handleContainerVirtualRectingRequiredEvent(
    container: ComponentContainer,
    width: number,
    height: number
  ) {
    const containerBoundingClientRect =
      container.element.getBoundingClientRect();
    const left =
      containerBoundingClientRect.left -
      this._goldenLayoutBoundingClientRect.left;
    const top =
      containerBoundingClientRect.top -
      this._goldenLayoutBoundingClientRect.top;

    const componentRef = this._componentRefMap.get(container);
    if (componentRef === undefined) {
      throw new Error(
        'handleContainerVirtualRectingRequiredEvent: ComponentRef not found'
      );
    }

    const parent = container.parent;
    const grand_parent = parent.parent;
    const grand_parent_children_elements = grand_parent.element.children;
    const component = componentRef.instance;

    if (width < 250 || height < 150) {
      for (let i = 0; i < grand_parent_children_elements.length; i++) {
        this.renderer.setStyle(
          grand_parent_children_elements[i],
          'visibility',
          'hidden'
        );
      }

      component.setVisibility(false);
      component.handleVisibilityChange(false);

      this.renderer.addClass(
        grand_parent.element,
        'collapsed-golden-layout-container'
      );

      if (width < 150) {
        this.renderer.addClass(grand_parent.element, 'vertical-dots');
      } else {
        this.renderer.addClass(grand_parent.element, 'horizontal-dots');
      }

      this._collapsedComponentContainers.add(container);
    } else if (this._collapsedComponentContainers.has(container)) {
      this._collapsedComponentContainers.delete(container);

      component.setVisibility(true);
      component.handleVisibilityChange(true);

      for (let i = 0; i < grand_parent_children_elements.length; i++) {
        this.renderer.removeStyle(
          grand_parent_children_elements[i],
          'visibility'
        );
      }

      this._componentRefMap.get(container).instance.setVisibility(true);
      this.renderer.removeClass(
        grand_parent.element,
        'collapsed-golden-layout-container'
      );

      this.renderer.removeClass(grand_parent.element, 'vertical-dots');
      this.renderer.removeClass(grand_parent.element, 'horizontal-dots');
    }

    component.setPositionAndSize(left, top, width, height);
    component.handleResponsiveChange(left, top, width, height);
  }

  private handleContainerVisibilityChangeRequiredEvent(
    container: ComponentContainer,
    visible: boolean
  ) {
    const componentRef = this._componentRefMap.get(container);
    if (componentRef === undefined) {
      throw new Error(
        'handleContainerVisibilityChangeRequiredEvent: ComponentRef not found'
      );
    }

    const component = componentRef.instance;

    component.setVisibility(visible);
    component.handleVisibilityChange(visible);
  }

  private handleContainerVirtualZIndexChangeRequiredEvent(
    container: ComponentContainer,
    logicalZIndex: LogicalZIndex,
    defaultZIndex: string
  ) {
    const componentRef = this._componentRefMap.get(container);
    if (componentRef === undefined) {
      throw new Error(
        'handleContainerVirtualZIndexChangeRequiredEvent: ComponentRef not found'
      );
    }

    const component = componentRef.instance;
    component.setZIndex(defaultZIndex);
    component.handleZIndexChange(logicalZIndex, defaultZIndex);

    if (logicalZIndex === 'base') {
      // Triggers a Redraw, to prevent faulty rendering after minimization
      this.goldenLayout.setSize(
        this.goldenLayout.width + 4,
        this.goldenLayout.height + 4
      );
      this.goldenLayout.setSize(
        this.goldenLayout.width - 4,
        this.goldenLayout.height - 4
      );
    }
  }

  reactOnViewModeChange(viewMode: ViewMode) {
    if (this.goldenLayout.rootItem) {
      const stackItem = findContentItemByUniqueID(
        ActivityOverviewComponent.componentName + '_Container_Stack',
        this.goldenLayout.rootItem
      ) as Stack;

      switch (viewMode) {
        case ViewMode.PERFORMANCE:
          stackItem.setActiveComponentItem(
            this.goldenLayout.findFirstComponentItemById(
              VariantPerformanceComponent.componentName
            ),
            true
          );
          break;

        case ViewMode.CONFORMANCE:
          stackItem.setActiveComponentItem(
            this.goldenLayout.findFirstComponentItemById(
              ConformanceTabComponent.componentName
            ),
            true
          );
          break;

        default:
          stackItem.setActiveComponentItem(
            this.goldenLayout.findFirstComponentItemById(
              ActivityOverviewComponent.componentName
            ),
            true
          );
          break;
      }
    }
  }
}
