import {
  LayoutConfig,
  ItemType,
  ComponentItemConfig,
  StackItemConfig,
  RowOrColumnItemConfig,
  Side,
} from 'golden-layout';

import { ProcessTreeEditorComponent } from '../../process-tree-editor/process-tree-editor.component';
import { VariantExplorerComponent } from '../../variant-explorer/variant-explorer.component';
import { ActivityOverviewComponent } from '../../activity-overview/activity-overview.component';
import { ModelPerformanceComponent } from '../../performance/performance.component';
import { VariantPerformanceComponent } from '../../variant-performance/variant-performance.component';
import { ConformanceTabComponent } from '../../conformance-tab/conformance-tab.component';

export const baseLayout: LayoutConfig = {
  dimensions: {
    borderWidth: 0.75,
    borderGrabWidth: 10,
    minItemHeight: 10,
    minItemWidth: 10,
  },
  settings: {
    showPopoutIcon: false,
    constrainDragToContainer: true,
  },
  root: {
    type: ItemType.column,
    content: [
      {
        type: ItemType.row,
        height: 61.803,
        isClosable: false,
        reorderEnabled: false,
        id: ProcessTreeEditorComponent.componentName + '_Container_Row',
        content: [
          {
            type: ItemType.stack,
            header: {
              show: Side.left,
            },
            isClosable: true,
            content: [
              {
                type: 'component',
                title: 'Process Tree Editor',
                isClosable: false,
                reorderEnabled: false,
                id: ProcessTreeEditorComponent.componentName,
                componentType: ProcessTreeEditorComponent.componentName,
                componentState: { cssParentClass: 'process-tree-editor-stack' },
              } as ComponentItemConfig,
            ],
          },
        ],
      } as RowOrColumnItemConfig,
      {
        type: ItemType.row,
        height: 38.197,
        isClosable: true,
        content: [
          {
            type: ItemType.stack,
            height: 38.197,
            isClosable: false,
            width: 61.803,
            id: VariantExplorerComponent.componentName + '_Container_Stack',
            content: [
              {
                id: VariantExplorerComponent.componentName,
                type: 'component',
                title: 'Variant Explorer',
                isClosable: false,
                cssClass: 'highlight',
                reorderEnabled: false,
                componentType: VariantExplorerComponent.componentName,
                componentState: { cssParentClass: 'variant-explorer-stack' },
              } as ComponentItemConfig,
            ],
          } as StackItemConfig,
          {
            type: ItemType.stack,
            height: 38.197,
            isClosable: false,
            width: 61.803,
            id: ActivityOverviewComponent.componentName + '_Container_Stack',
            content: [
              {
                type: 'component',
                header: {
                  show: false,
                },
                width: 38.197,
                isClosable: false,
                reorderEnabled: false,
                title: 'Activity Overview',
                id: ActivityOverviewComponent.componentName,
                componentType: ActivityOverviewComponent.componentName,
                componentState: { cssParentClass: 'info-box-stack' },
              } as ComponentItemConfig,
              {
                type: 'component',
                header: {
                  show: false,
                },
                width: 38.197,
                isClosable: false,
                reorderEnabled: true,
                title: 'Model Performance',
                id: ModelPerformanceComponent.componentName,
                componentType: ModelPerformanceComponent.componentName,
                componentState: { cssParentClass: 'info-box-stack' },
              } as ComponentItemConfig,
              {
                type: 'component',
                header: {
                  show: false,
                },
                width: 38.197,
                isClosable: false,
                reorderEnabled: true,
                title: 'Variant Performance',
                id: VariantPerformanceComponent.componentName,
                componentType: VariantPerformanceComponent.componentName,
                componentState: { cssParentClass: 'info-box-stack' },
              } as ComponentItemConfig,
              {
                type: 'component',
                header: {
                  show: false,
                },
                width: 38.197,
                isClosable: false,
                reorderEnabled: true,
                title: 'Conformance',
                id: ConformanceTabComponent.componentName,
                componentType: ConformanceTabComponent.componentName,
                componentState: { cssParentClass: 'info-box-stack' },
              } as ComponentItemConfig,
            ],
          } as StackItemConfig,
        ],
      } as RowOrColumnItemConfig,
    ],
  } as RowOrColumnItemConfig,
};
