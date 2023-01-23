import {
  ComponentFactoryResolver,
  Injectable,
  Injector,
  StaticProvider,
  Type,
} from '@angular/core';
import {
  ComponentContainer,
  ComponentItemConfig,
  ContentItem,
  GoldenLayout,
  JsonValue,
  LayoutManager,
  RowOrColumn,
} from 'golden-layout';
import { GoldenLayoutHostComponent } from 'src/app/components/golden-layout-host/golden-layout-host.component';
import { LayoutChangeDirective } from 'src/app/directives/layout-change/layout-change.directive';

@Injectable({
  providedIn: 'root',
})
export class GoldenLayoutComponentService {
  private _componentTypeMap = new Map<string, Type<LayoutChangeDirective>>();
  private _goldenLayoutHostComponent: GoldenLayoutHostComponent;
  private _goldenLayout: GoldenLayout;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  splitViewIds = [];

  registerComponentType(
    name: string,
    componentType: Type<LayoutChangeDirective>
  ) {
    this._componentTypeMap.set(name, componentType);
  }

  getRegisteredComponentTypeNames(): string[] {
    const count = this._componentTypeMap.size;
    const result = new Array<string>(count);
    let idx = 0;
    for (let [key, value] of this._componentTypeMap) {
      result[idx++] = key;
    }
    return result;
  }

  set goldenLayout(goldenLayout: GoldenLayout) {
    this._goldenLayout = goldenLayout;
  }

  get goldenLayout() {
    return this._goldenLayout;
  }

  set goldenLayoutHostComponent(
    goldenLayoutHostComponent: GoldenLayoutHostComponent
  ) {
    this._goldenLayoutHostComponent = goldenLayoutHostComponent;
  }

  get goldenLayoutHostComponent() {
    return this._goldenLayoutHostComponent;
  }

  createComponent(
    componentTypeJsonValue: JsonValue,
    container: ComponentContainer
  ) {
    const componentType = this._componentTypeMap.get(
      componentTypeJsonValue as string
    );
    if (componentType === undefined) {
      throw new Error('Unknown component type');
    } else {
      const provider: StaticProvider = {
        provide: LayoutChangeDirective.GoldenLayoutContainerInjectionToken,
        useValue: container,
      };
      const injector = Injector.create({
        providers: [provider],
      });
      const componentFactoryRef =
        this.componentFactoryResolver.resolveComponentFactory<LayoutChangeDirective>(
          componentType
        );
      return componentFactoryRef.create(injector);
    }
  }

  openWindow(
    componentID: string,
    parentContainerID: string,
    LocationSelectors: LayoutManager.LocationSelector[],
    itemConfig: ComponentItemConfig
  ) {
    const editor = this._goldenLayout.findFirstComponentItemById(componentID);

    const createComponent = (
      parentContainerID,
      itemConfig,
      LocationSelectors
    ) => {
      if (parentContainerID) {
        this._goldenLayout
          .findFirstComponentItemById(parentContainerID)
          .focus();
      }

      if (LocationSelectors) {
        this._goldenLayout.addItemAtLocation(itemConfig, LocationSelectors);
      } else {
        this._goldenLayout.addItem(itemConfig);
      }
    };

    // Destroy the split window instance, and register the creation after the semaphor fires TODO carry over the state
    // Issue, when in the Future multiple Editor might exist and can be closed in rapid succesion

    // TODO READD SPLIT WINDOW CHECK
    if (editor && this.splitViewIds.includes(componentID)) {
      editor.close();

      this.splitViewIds.forEach((item, index) => {
        if (item === componentID) this.splitViewIds.splice(index, 1);
      });

      createComponent(parentContainerID, itemConfig, LocationSelectors);

      // Create the component at the specified selector
    } else if (!editor) {
      createComponent(parentContainerID, itemConfig, LocationSelectors);
    } else {
      editor.focus();
    }
  }

  createBPMNSplitViewWindow(splitParentID, componentID) {
    const parent = this._goldenLayout.findFirstComponentItemById(splitParentID);

    if (this.splitViewIds.includes(componentID)) {
      this._goldenLayout.findFirstComponentItemById(componentID)?.close();

      this.splitViewIds.forEach((item, index) => {
        if (item === componentID) this.splitViewIds.splice(index, 1);
      });
    } else {
      this.splitViewIds.push(componentID);
      this._goldenLayout.findFirstComponentItemById(componentID)?.close();

      const itemConfig: ComponentItemConfig = {
        id: componentID,
        type: 'component',
        title: 'BPMN Editor',
        isClosable: true,
        header: {
          show: false,
        },
        componentType: componentID,
      };

      const pt_editor_row = findContentItemByUniqueID(
        splitParentID + '_Container_Row',
        this._goldenLayout.rootItem
      );

      (pt_editor_row as RowOrColumn).addItem(itemConfig, 1);
    }
  }
}

export function findContentItemByUniqueID(
  id: string,
  groundItem: ContentItem
): ContentItem | undefined {
  const contentItems = groundItem.contentItems;

  const contentItemCount = contentItems.length;
  if (contentItemCount === 0) {
    return undefined;
  } else {
    for (let i = 0; i < contentItemCount; i++) {
      const contentItem = contentItems[i];
      if (contentItem.id === id) {
        return contentItem;
      }
    }

    for (let i = 0; i < contentItemCount; i++) {
      const contentItem = contentItems[i];
      const foundContentItem = findContentItemByUniqueID(id, contentItem);
      if (foundContentItem !== undefined) {
        return foundContentItem;
      }
    }

    return undefined;
  }
}
