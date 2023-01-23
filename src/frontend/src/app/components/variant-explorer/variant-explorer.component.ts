import {
  VariantFilter,
  VariantFilterService,
} from './../../services/variantFilterService/variant-filter.service';

import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
} from '@angular/core';

import {
  ComponentContainer,
  ComponentItem,
  ComponentItemConfig,
  GoldenLayout,
  LayoutManager,
  LogicalZIndex,
  Stack,
} from 'golden-layout';
import { Subject } from 'rxjs';
import {
  delay,
  finalize,
  mergeMap,
  retryWhen,
  take,
  tap,
  takeUntil,
  filter,
} from 'rxjs/operators';
import { GoldenLayoutHostComponent } from 'src/app/components/golden-layout-host/golden-layout-host.component';
import { LayoutChangeDirective } from 'src/app/directives/layout-change/layout-change.directive';
import { VariantDrawerDirective } from 'src/app/directives/variant-drawer/variant-drawer.directive';

import { TimeUnit } from 'src/app/objects/TimeUnit';
import { HumanizeDurationPipe } from 'src/app/pipes/humanize-duration.pipe';
import {
  AlignmentType,
  ConformanceCheckingService,
} from 'src/app/services/conformanceChecking/conformance-checking.service';
import { GoldenLayoutComponentService } from 'src/app/services/goldenLayoutService/golden-layout-component.service';
import { LogService, LogStats } from 'src/app/services/logService/log.service';
import { ModelPerformanceColorScaleService } from 'src/app/services/performance-color-scale.service';
import { PerformanceService } from 'src/app/services/performance.service';
import { PolygonDrawingService } from 'src/app/services/polygon-drawing.service';
import { ProcessTreeService } from 'src/app/services/processTreeService/process-tree.service';
import { VariantPerformanceService } from 'src/app/services/variant-performance.service';
import { VariantService } from 'src/app/services/variantService/variant.service';
import { originalOrder } from 'src/app/utils/util';
import { BackendService } from '../../services/backendService/backend.service';
import { ColorMapService } from '../../services/colorMapService/color-map.service';
import { ImageExportService } from '../../services/imageExportService/image-export-service';
import { SharedDataService } from '../../services/sharedDataService/shared-data.service';
import { DropzoneConfig } from '../drop-zone/drop-zone.component';
import { SubvariantExplorerComponent } from './subvariant-explorer/subvariant-explorer.component';
import { VariantSorter } from '../../objects/Variants/variant-sorter';
import { Variant } from 'src/app/objects/Variants/variant';
import {
  VariantElement,
  SequenceGroup,
  ParallelGroup,
  deserialize,
} from 'src/app/objects/Variants/variant_element';
import {
  activityColor,
  clickCallback,
  contextMenuCallback,
} from './functions/variant-drawer-callbacks';
import { exportVariantDrawer } from './functions/export-variant-explorer';
import {
  fadeInOutComponent,
  openCloseComponent,
} from 'src/app/animations/component-animations';
import { collapsingText } from 'src/app/animations/text-animations';
import { textColorForBackgroundColor } from 'src/app/utils/render-utils';
import { processTreesEqual } from 'src/app/objects/ProcessTree/utility-functions/process-tree-integrity-check';
import { ViewMode } from 'src/app/objects/ViewMode';
import { VariantViewModeService } from 'src/app/services/viewModeServices/variant-view-mode.service';
import { EditorOptions } from './variant-query/variant-query.component';
import { ContextMenuItem } from './variant-explorer-context-menu/variant-explorer-context-menu.component';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ProcessTree } from 'src/app/objects/ProcessTree/ProcessTree';
import { IVariant } from 'src/app/objects/Variants/variant_interface';
import { LoopCollapsedVariant } from 'src/app/objects/Variants/loop_collapsed_variant';

@Component({
  selector: 'app-variant-explorer',
  templateUrl: './variant-explorer.component.html',
  styleUrls: ['./variant-explorer.component.scss'],
  animations: [collapsingText, fadeInOutComponent, openCloseComponent],
})
export class VariantExplorerComponent
  extends LayoutChangeDirective
  implements OnInit, AfterViewInit, OnDestroy
{
  constructor(
    private colorMapService: ColorMapService,
    private sharedDataService: SharedDataService,
    public variantService: VariantService,
    private variantFilterService: VariantFilterService,
    private backendService: BackendService,
    private logService: LogService,
    private imageExportService: ImageExportService,
    private polygonDrawingService: PolygonDrawingService,
    @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken)
    private container: ComponentContainer,
    public processTreeService: ProcessTreeService,
    elRef: ElementRef,
    renderer: Renderer2,
    public performanceService: PerformanceService,
    private performanceColorService: ModelPerformanceColorScaleService,
    public variantPerformanceService: VariantPerformanceService,
    private conformanceCheckingService: ConformanceCheckingService,
    private goldenLayoutComponentService: GoldenLayoutComponentService,
    public variantViewModeService: VariantViewModeService,
    private toastService: ToastService
  ) {
    super(elRef.nativeElement, renderer);
  }

  collapse: boolean = false;
  maximized: boolean = false;

  public variants: Variant[] = [];
  public displayed_variants: IVariant[] = [];
  public colorMap: Map<string, string>;
  public sidebarHeight = 0;

  public logStats: LogStats = null;

  public currentlyDisplayedProcessTree;
  protected unsubscribe: Subject<void> = new Subject<void>();

  public correctTreeSyntax = false;
  expansionState: Map<string, boolean> = new Map<string, boolean>();
  serviceTimeColorMap: any;
  waitingTimeColorMap: any;

  public VM = ViewMode;

  public svgRenderingInProgress: boolean = false;
  public variantExplorerOutOfFocus: boolean = false;

  _goldenLayoutHostComponent: GoldenLayoutHostComponent;
  _goldenLayout: GoldenLayout;
  _subvariantcomponentItemsMap: Map<string, ComponentItem> = new Map<
    string,
    ComponentItem
  >();

  dropZoneConfig: DropzoneConfig;
  public isAscendingOrder: boolean = false;
  public sortingFeature: string = 'count';
  queryActive: boolean = false;
  showQueryInfo: boolean = false;

  contextMenu_xPos: number = 10;
  contextMenu_yPos: number = 10;
  contextMenu_element: VariantElement;
  contextMenu_variant: VariantElement;
  contextMenu_directive: VariantDrawerDirective;

  filterMap: Map<string, VariantFilter> = new Map<string, VariantFilter>();

  // Define Callbacks
  variantClickCallBack = clickCallback.bind(this);
  openContextCallback = contextMenuCallback.bind(this);
  computeActivityColor = activityColor.bind(this);

  public options: EditorOptions = new EditorOptions();

  // Exporter
  exportVariantSVG = exportVariantDrawer.bind(this);

  public traceInfixSelectionMode: boolean = false;

  @ViewChild('variantExplorer', { static: true })
  variantExplorerDiv: ElementRef<HTMLDivElement>;

  @ViewChildren(VariantDrawerDirective)
  variantDrawers: QueryList<VariantDrawerDirective>;

  @ViewChild('variantExplorerContainer')
  variantExplorerContainer: ElementRef<HTMLDivElement>;

  @ViewChild('tooltipContainer')
  tooltipContainer: ElementRef<HTMLDivElement>;

  public visibleVariantsHeight = 1000;

  public deletedVariants: Variant[][] = [];

  timeUnit = TimeUnit;

  selectedGranularity = TimeUnit.SEC;

  originalOrder = originalOrder;

  deleteVariant = function () {
    const bids = this.variantService.variants
      .filter((v) => v.variant === this.contextMenu_variant)
      .map((v) => v.bid);

    this.variantService.deleteVariants(bids);
  }.bind(this);

  contextMenuOptions: Array<ContextMenuItem> = [
    new ContextMenuItem('Delete Variant', 'bi-trash', this.deleteVariant),
  ];

  private _destroy$ = new Subject();

  ngOnInit(): void {
    this.dropZoneConfig = new DropzoneConfig(
      '.xes',
      'false',
      'false',
      '<large> Import <strong>Event Log</strong> .xes file</large>'
    );

    // initialize variables and initial variants
    this.init();
    // update variant explorer on log change
    this.listenForLogChange();
    // redraw variants on color map change
    this.listenForColorMapChange();
    // update view when activity names change
    this.listenForCorrectSyntax();
    this.listenForProcessTreeChange();
    this.conformanceCheckingService.connect();
    this.subscribeForConformanceCheckingResults();
    this.listenForLogGranularityChange();
    this.listenForLogStatChange();
    this.listenForViewModeChange();
    this.listenForLoopCollapsedVariantsChange();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  @HostListener('window:keydown.control.q', ['$event'])
  onopenComponent(e) {
    this.toggleQuery();
  }

  ngAfterViewInit() {
    this.polygonDrawingService.setElementRefereneces(
      this.variantExplorerContainer,
      this.tooltipContainer
    );

    this._goldenLayoutHostComponent =
      this.goldenLayoutComponentService.goldenLayoutHostComponent;
    this._goldenLayout = this.goldenLayoutComponentService.goldenLayout;

    const variantExplorerItem = this._goldenLayout.findFirstComponentItemById(
      VariantExplorerComponent.componentName
    );

    variantExplorerItem.focus();

    this.variantService.variants$
      .pipe(takeUntil(this._destroy$))
      .subscribe((variants) => {
        this.variantService.areVariantLoopsCollapsed = false;
        this.variants = variants;
        this.displayed_variants = variants.filter((v) => v.isDisplayed);
        this.sort(this.sortingFeature);
        this.closeAllSubvariantWindows();
        this.redraw_components();
      });

    this.variantFilterService.variantFilters$.subscribe((filterMap) => {
      this.filterMap = filterMap;

      if (filterMap.size > 0) {
        const intersectSets = function (a: Set<number>, b: Set<number>) {
          const c: Set<number> = new Set<number>();
          a.forEach((v) => b.has(v) && c.add(v));
          return c;
        };

        const filterSet = Array.from(filterMap.values())
          .map((f) => f.bids)
          .reduce((a, b) => intersectSets(a, b));

        this.displayed_variants = this.variants.filter((v) => {
          if (filterSet.has(v.bid)) {
            v.isDisplayed = true;
            return true;
          } else {
            v.isDisplayed = false;
          }
        });
      } else {
        this.displayed_variants = this.variants;
        this.variants.forEach((v) => (v.isDisplayed = true));
      }

      this.updateAllSubvariantWindows();
      this.redraw_components();
    });

    this.variantPerformanceService.serviceTimeColorMap
      .pipe(takeUntil(this._destroy$))
      .subscribe((colorMap) => {
        if (colorMap !== undefined) {
          this.serviceTimeColorMap = colorMap;
          this.redraw_components();
        }
      });

    this.variantPerformanceService.waitingTimeColorMap
      .pipe(takeUntil(this._destroy$))
      .subscribe((colorMap) => {
        if (colorMap !== undefined) {
          this.waitingTimeColorMap = colorMap;
          this.redraw_components();
        }
      });
  }

  private init() {
    console.warn('Running Init');
    this.displayed_variants = [];
    this.backendService
      .resetLogCache() // for now show the sample log again on reload
      .pipe(retryWhen((errors) => errors.pipe(delay(500), take(50)))) // backend might need some time to start up
      .pipe(
        mergeMap(() =>
          // Time granularity is null because the granularity is determined in the backend
          this.backendService.getLogPropsAndUpdateState(null, 'preload')
        ),
        takeUntil(this._destroy$)
      )
      .subscribe((val) => {
        this.selectedGranularity = val.timeGranularity;
      });
  }

  private listenForProcessTreeChange() {
    this.processTreeService.currentDisplayedProcessTree$
      .pipe(
        takeUntil(this._destroy$),
        filter(
          (tree) => !processTreesEqual(tree, this.currentlyDisplayedProcessTree)
        )
      )
      .subscribe((tree) => {
        this.currentlyDisplayedProcessTree = tree;

        this.variants.forEach((variant) => {
          if (variant.usedTreeForConformanceChecking)
            variant.isConformanceOutdated = !processTreesEqual(
              tree,
              variant.usedTreeForConformanceChecking
            );
        });
        this.redraw_components();
      });
  }

  private listenForCorrectSyntax() {
    this.processTreeService.correctTreeSyntax$
      .pipe(takeUntil(this._destroy$))
      .subscribe((res) => {
        this.correctTreeSyntax = res;
      });
  }

  private listenForColorMapChange() {
    this.colorMapService.colorMap$
      .pipe(takeUntil(this._destroy$))
      .subscribe((colorMap) => {
        this.colorMap = colorMap;
        this.redraw_components();
      });
  }

  private listenForLogStatChange() {
    this.logService.logStatistics$
      .pipe(takeUntil(this._destroy$))
      .subscribe((logStat) => {
        this.logStats = logStat;
      });
  }

  private listenForLogChange() {
    this.logService.loadedEventLog$
      .pipe(
        tap(() => {
          this.closeAllSubvariantWindows();
          this.variantViewModeService.viewMode = ViewMode.STANDARD;
          this.variantService.areVariantLoopsCollapsed = false;
        })
      )
      .pipe(takeUntil(this._destroy$))
      .subscribe();
  }

  private redraw_components() {
    if (this.variantDrawers) {
      for (let component of this.variantDrawers) {
        component.redraw();
      }
    }
  }

  subscribeForConformanceCheckingResults(): void {
    this.conformanceCheckingService.varResults
      .pipe(takeUntil(this._destroy$))
      .subscribe(
        (res) => {
          const variant = this.variants.find((v) => v.id == res.id);
          variant.calculationInProgress = false;
          variant.isTimeouted = res.isTimeout;
          variant.isConformanceOutdated = res.isTimeout;

          if (!res.isTimeout) {
            variant.alignment = deserialize(res.alignment);
            variant.alignment.setExpanded(variant.variant.getExpanded());
            variant.deviations = res.deviations;
            variant.usedTreeForConformanceChecking = res.processTree;
          }

          this.updateAlignmentStatistics();
          this.variantDrawers
            .find((drawer) => drawer.variant.id == res.id)
            ?.redraw();
        },
        (_) => {
          this.variants.forEach((v) => {
            v.calculationInProgress = false;
            v.alignment = undefined;
            v.deviations = undefined;
            v.usedTreeForConformanceChecking = undefined;
          });

          this.updateAlignmentStatistics();
          this.redraw_components();
        }
      );
  }

  updateAlignments(): void {
    this.variants.forEach((v) => {
      this.updateConformanceForVariant(v, 0);
    });
  }

  // @ Refactor into Alignment Service
  updateAlignmentStatistics(): void {
    let numberFittingVariants = 0;
    let numberFittingTraces = 0;

    this.variants.forEach((v) => {
      if (v.deviations == 0) {
        numberFittingVariants++;
        numberFittingTraces += v.count;
      }
    });

    this.logService.update_log_stats(
      numberFittingTraces,
      numberFittingVariants
    );
  }

  updateConformanceForVariant(variant: IVariant, timeout: number): void {
    let underlyingVariants = [];
    if (variant instanceof LoopCollapsedVariant) {
      underlyingVariants = variant.variants;
    } else {
      underlyingVariants = [variant];
    }

    underlyingVariants.forEach((v) => {
      v.calculationInProgress = true;
      v.deviations = undefined;

      const resubscribe = this.conformanceCheckingService.calculateConformance(
        v.id,
        v.infixType,
        this.processTreeService.currentDisplayedProcessTree,
        v.variant.serialize(1),
        timeout,
        AlignmentType.VariantAlignment
      );

      if (resubscribe) {
        this.subscribeForConformanceCheckingResults();
      }
    });
  }

  updateConformanceForSingleVariantClicked(variant: IVariant): void {
    if (variant.isTimeouted) {
      this.conformanceCheckingService.showConformanceTimeoutDialog(
        variant,
        this.updateConformanceForVariant.bind(this)
      );
    } else {
      this.updateConformanceForVariant(variant, 0);
    }
  }

  computePerformanceButtonColor = (variant: Variant) => {
    let tree;
    tree = this.performanceService.variantsPerformance.get(variant);

    if (!tree) {
      return null;
    }

    let selectedScale = this.performanceColorService.selectedColorScale;
    const colorScale = this.performanceColorService
      .getVariantComparisonColorScale()
      .get(tree.id);
    if (
      colorScale &&
      tree.performance?.[selectedScale.performanceIndicator]?.[
        selectedScale.statistic
      ] !== undefined
    ) {
      return colorScale.getColor(
        tree.performance[selectedScale.performanceIndicator][
          selectedScale.statistic
        ]
      );
    }
    return '#d3d3d3';
  };

  removeFilter(filter_name: string) {
    this.variantFilterService.removeVariantFilter(filter_name);
  }

  handleSelectInfix(variant: Variant) {
    this.variantService.addSelectedTraceInfix(
      this.variants.filter((v) => v.bid === variant.bid)[0],
      this.sortingFeature,
      this.isAscendingOrder
    );
  }

  discoverInitialModel(): void {
    const variants = this.getSelectedVariants().map((v) => v.variant);

    this.backendService
      .discoverProcessModelFromConcurrencyVariants(variants)
      .pipe(takeUntil(this._destroy$))
      .subscribe((tree) =>
        this.refreshConformanceIconsAfterModelChange(true, tree)
      );
  }

  changeQueryOption(event, option) {
    const newOptions: EditorOptions = new EditorOptions();
    Object.entries(this.options).forEach((v) => (newOptions[v[0]] = v[1]));
    newOptions[option] = event.target.checked;

    this.options = newOptions;
  }

  genSimpleVariants(variant: VariantElement): any {
    if (variant instanceof SequenceGroup) {
      return variant.elements;
    } else if (variant instanceof ParallelGroup) {
    } else {
      return [variant.asLeafNode().activity];
    }
  }

  mapVariantToEventList(variant): any {
    return {
      events: variant
        .flat()
        .filter((v) => v[1].toLowerCase() === 'complete')
        .map((v) => `${v[0]}`),
    };
  }

  selectionChangedForVariant(variant: Variant, isSelected: boolean): void {
    variant.isSelected = isSelected;
  }

  addSelectedVariantsToModel(): void {
    const selectedVariants = this.getSelectedVariants();

    // TODO we currently distinguish two cases here: 1. outdated conformance and 2. known conformance
    // in the future, we want to use caching in the backend and use only a single call from frontend
    if (this.isAnyVariantOutdated(selectedVariants)) {
      this.addSelectedVariantsToModelForOutdatedConformance(selectedVariants);
      return;
    }

    this.addSelectedVariantsToModelForGivenConformance(selectedVariants);
  }

  handleSelectTreePerformance(variant: Variant) {
    if (this.performanceService.isTreePerformanceAvailable(variant)) {
      if (this.performanceService.isTreePerformanceActive(variant)) {
        this.performanceService.unselectPerformance();
      } else {
        this.performanceService.setShownTreePerformance(variant);
      }
    } else {
      if (this.performanceService.calculationInProgress.has(variant)) {
        return;
      }
      if (this.currentlyDisplayedProcessTree) {
        this.performanceService.updatePerformance([variant]);
      }
    }
  }

  handlePerformanceRemove(variant: Variant) {
    this.performanceService.updatePerformance([], [variant]);
  }

  createSubVariantView(index) {
    const currently_maximized = this.maximized;

    const LocationSelectors: LayoutManager.LocationSelector[] = [
      {
        typeId: LayoutManager.LocationSelector.TypeId.FocusedStack,
        index: undefined,
      },
    ];

    this.cleanUpSubVariantMap();

    const id =
      SubvariantExplorerComponent.componentName +
      this.displayed_variants[index - 1].id;

    let componentItem = this._subvariantcomponentItemsMap.get(id);

    // Check if the component item reference already is stored and if the item still exists
    // Saves on a search by ID
    if (componentItem) {
      componentItem.focus();

      // Instantiate a new Subvariant Component for this variant if it did not exist or is closed
    } else {
      const variantExplorerItem = this._goldenLayout.findFirstComponentItemById(
        VariantExplorerComponent.componentName
      );

      variantExplorerItem.focus();

      const itemConfig: ComponentItemConfig = {
        id: id,
        type: 'component',
        title: 'Sub-Variants for ' + index,
        isClosable: true,
        reorderEnabled: true,
        componentState: {
          variant: this.displayed_variants[index - 1],
          index: index,
        },
        maximised: true,
        componentType: SubvariantExplorerComponent.componentName,
      };

      this._goldenLayout.addItemAtLocation(itemConfig, LocationSelectors);
      componentItem = this._goldenLayout.findFirstComponentItemById(id);
      this._subvariantcomponentItemsMap.set(id, componentItem);

      // Keep the stack maximized
      if (currently_maximized) {
        const stack = componentItem.container.parent.parent as Stack;
        stack.toggleMaximise();
      }

      variantExplorerItem.focus();
    }
  }

  closeAllSubvariantWindows(): void {
    this._subvariantcomponentItemsMap.forEach((value) => {
      if (
        value &&
        this._goldenLayoutHostComponent.getComponentRef(value.container)
      ) {
        value.close();
      }
    });

    // Reset the Map to empty
    this._subvariantcomponentItemsMap = new Map<string, ComponentItem>();
  }

  updateAllSubvariantWindows(): void {
    this._subvariantcomponentItemsMap.forEach((value) => {
      if (value) {
        value.setTitle('Sub-Variant');
      }
    });

    for (let index = 0; index < this.displayed_variants.length; index++) {
      const id =
        SubvariantExplorerComponent.componentName +
        this.displayed_variants[index].id;
      let componentItem = this._subvariantcomponentItemsMap.get(id);
      if (componentItem) {
        componentItem.setTitle('Sub-Variants for ' + (index + 1));
        let c = componentItem.component as SubvariantExplorerComponent;
        c.setIndex(index + 1);
      }
    }
  }

  cleanUpSubVariantMap() {
    for (let index = 0; index < this.variants.length; index++) {
      const id =
        SubvariantExplorerComponent.componentName + this.variants[index].id;
      const componentItem = this._subvariantcomponentItemsMap.get(id);
      if (
        componentItem &&
        !this._goldenLayoutHostComponent.getComponentRef(
          componentItem.container
        )
      ) {
        this._subvariantcomponentItemsMap.delete(id);
      }
    }
  }

  getSelectedVariants(): Variant[] {
    return this.displayed_variants.filter((v) => v.isSelected);
  }

  isAnyVariantOutdated(variants: Variant[]): boolean {
    return variants.some((v) => v.isConformanceOutdated);
  }

  isConformanceOutdated(): boolean {
    return this.isAnyVariantOutdated(this.variants);
  }

  isAlignmentCalculationInProgress(): boolean {
    return this.variants.some((v) => v.calculationInProgress);
  }

  addSelectedVariantsToModelForOutdatedConformance(
    selectedVariants: Variant[]
  ): void {
    const selectedVariantElements = selectedVariants.map((v) => v.variant);

    this.backendService
      .addConcurrencyVariantsToProcessModelForUnknownConformance(
        selectedVariantElements
      )
      .pipe(takeUntil(this._destroy$))
      .subscribe((tree) => {
        this.refreshConformanceIconsAfterModelChange(false, tree);
      });
  }

  addSelectedVariantsToModelForGivenConformance(
    selectedVariants: Variant[]
  ): void {
    const fittingVariants = selectedVariants
      .filter((v) => v.deviations == 0)
      .map((v) => v.variant);
    const variantsToAdd = selectedVariants
      .filter((v) => v.deviations > 0)
      .map((v) => v.variant);

    this.backendService
      .addConcurrencyVariantsToProcessModel(variantsToAdd, fittingVariants)
      .pipe(takeUntil(this._destroy$))
      .subscribe((tree) => {
        this.refreshConformanceIconsAfterModelChange(false, tree);
      });
  }

  refreshConformanceIconsAfterModelChange(
    wasInitialDiscovery: boolean,
    pt: ProcessTree
  ): void {
    if (wasInitialDiscovery) {
      this.variants.forEach((v) => {
        v.deviations = undefined;
        v.calculationInProgress = false;
        v.usedTreeForConformanceChecking = undefined;
      });
    }

    this.getSelectedVariants().forEach((v) => {
      v.isAddedFittingVariant = true;
      v.deviations = 0;
      // Make variant as fitting alignment
      v.alignment = v.variant;
      v.alignment.updateConformance(1);
      v.usedTreeForConformanceChecking = pt;

      v.calculationInProgress = false;
      v.isConformanceOutdated = false;
      v.isTimeouted = false;
    });

    // redraw if in conformance view
    if (this.variantViewModeService.viewMode === ViewMode.CONFORMANCE)
      this.getSelectedVariants().forEach((v) => {
        this.variantDrawers
          .find((drawer) => drawer.variant.id == v.id)
          .redraw();
      });
  }

  isAnyVariantSelected(): boolean {
    return this.variants.some((v) => v.isSelected);
  }

  isNoVariantSelected(): boolean {
    return !this.isAnyVariantSelected();
  }

  areAllDisplayedVariantsSelected(): boolean {
    return this.displayed_variants.every((v) => v.isSelected);
  }

  unSelectAllChanged(isSelected: boolean): void {
    this.displayed_variants.forEach((v) => (v.isSelected = isSelected));
  }

  areAllVariantsExpanded(): boolean {
    if (
      this.variantDrawers === undefined ||
      (this.variants && this.variants.length < 1)
    ) {
      return false;
    }

    const unexpandedVariantsExist = this.variants.some(
      (v) => !v.variant.expanded
    );
    return !unexpandedVariantsExist;
  }

  unExpandAll(): void {
    const shouldExpand = !this.areAllVariantsExpanded();

    this.variantDrawers.forEach((c) => {
      if (
        this.variantViewModeService.viewMode !== ViewMode.PERFORMANCE &&
        shouldExpand != c.variant.variant.expanded
      ) {
        c.setExpanded(shouldExpand);
        c.redraw();
      }
    });

    // Necessary, because there are only variant drawers for children that are rendered.
    // This is often only a subset of variants because of lazy loading.
    this.variants.forEach((v) => v.variant.setExpanded(shouldExpand));
  }

  handleResponsiveChange(
    left: number,
    top: number,
    width: number,
    height: number
  ): void {
    this.collapse = width < 875;

    this.sidebarHeight = height;
  }

  handleVisibilityChange(visibility: boolean): void {}

  handleZIndexChange(
    logicalZIndex: LogicalZIndex,
    defaultZIndex: string
  ): void {
    this.maximized = logicalZIndex === 'stackMaximised';
  }

  meanPerformance(): string {
    let p = this.performanceService.mergedPerformance?.performance;
    let selectedScale = this.performanceColorService.selectedColorScale;
    let pValue =
      p[selectedScale.performanceIndicator]?.[selectedScale.statistic];
    return HumanizeDurationPipe.apply(pValue * 1000, { round: true });
  }

  variantPerformanceColor(): string {
    let tree = this.performanceService.mergedPerformance;
    if (!tree) {
      return null;
    }
    let selectedScale = this.performanceColorService.selectedColorScale;
    const colorScale = this.performanceColorService
      .getVariantComparisonColorScale()
      .get(tree.id);
    if (
      colorScale &&
      tree.performance?.[selectedScale.performanceIndicator]?.[
        selectedScale.statistic
      ] !== undefined
    ) {
      return colorScale.getColor(
        tree.performance[selectedScale.performanceIndicator][
          selectedScale.statistic
        ]
      );
    }
    return '#d3d3d3';
  }

  textColorForBackgroundColor(): string {
    if (this.variantPerformanceColor() === null) {
      return 'white';
    }
    return textColorForBackgroundColor(this.variantPerformanceColor());
  }

  toggleQueryInfo(event: Event): void {
    this.showQueryInfo = !this.showQueryInfo;
    event.stopPropagation();
  }

  toggleBlur(event) {
    this.variantExplorerOutOfFocus = event;
  }

  toggleQuery() {
    this.queryActive = !this.queryActive;
  }

  sort(sortingFeature: string): void {
    this.sortingFeature = sortingFeature;
    this.displayed_variants = VariantSorter.sort(
      this.displayed_variants,
      this.sortingFeature,
      this.isAscendingOrder
    ) as Variant[];
    this.variantExplorerDiv.nativeElement.scroll(0, 0);
    this.updateAllSubvariantWindows();
  }

  onSortOrderChanged(isAscending: boolean): void {
    this.isAscendingOrder = isAscending;
    this.sort(this.sortingFeature);
  }

  toggleTraceInfixSelectionMode(): void {
    this.traceInfixSelectionMode = !this.traceInfixSelectionMode;
    this.redraw_components();
  }

  onGranularityChange(granularity): void {
    if (this.processTreeService.currentDisplayedProcessTree)
      this.performanceService.unselectPerformance();

    this.selectedGranularity = granularity;
    this.backendService
      .getLogPropsAndUpdateState(granularity, this.logService.loadedEventLog)
      .pipe(takeUntil(this._destroy$))
      .subscribe();
  }

  listenForLogGranularityChange() {
    this.logService.logGranularity$
      .pipe(takeUntil(this._destroy$))
      .subscribe((granularity) => {
        this.selectedGranularity = granularity;
        this.variantService.areVariantLoopsCollapsed = false;
      });
  }

  onScroll(): void {}

  executeRemovalActionOnFilteredVariants(removeFiltered: boolean): void {
    let bids = [];
    let infoText = '';
    if (removeFiltered) {
      // remove all filtered variants
      bids = this.displayed_variants.map((v) => v.bid);
      infoText = 'Removed all filtered variants. Filters are cleared.';
    } else {
      // keep only filtered variants
      bids = this.variants.filter((v) => !v.isDisplayed).map((v) => v.bid);
      infoText = 'Removed all not filtered variants. Filters are cleared.';
    }

    this.variantService.deleteVariants(bids);

    for (let filter of this.filterMap.keys()) {
      this.removeFilter(filter);
    }

    this.toastService.showSuccessToast(
      'Variants removed',
      infoText,
      'bi-trash'
    );
  }

  private listenForViewModeChange() {
    this.variantViewModeService.viewMode$
      .pipe(takeUntil(this._destroy$))
      .subscribe((viewMode) => {
        if (viewMode !== ViewMode.STANDARD && this.traceInfixSelectionMode)
          this.toggleTraceInfixSelectionMode();
      });
  }

  private listenForLoopCollapsedVariantsChange() {
    this.variantService.collapsedVariants$
      .pipe(takeUntil(this._destroy$))
      .subscribe((variants) => {
        if (variants !== null) {
          this.traceInfixSelectionMode = false;
          this.displayed_variants = variants;
          this.sort(this.sortingFeature);
        } else {
          this.displayed_variants = this.variants;
        }
      });
  }

  showTiebreakerDialog() {
    this.variantService.showTiebreakerDialog.next();
  }

  handleSelectTreeConformance(v: Variant) {
    if (this.conformanceCheckingService.isTreeConformanceAvailable(v)) {
      if (this.conformanceCheckingService.isTreeConformanceActive(v)) {
        this.conformanceCheckingService.unselectTreeConformance();
      } else {
        this.conformanceCheckingService.setShownTreeConformance(v);
      }
    } else {
      if (this.conformanceCheckingService.calculationInProgress.has(v)) {
        return;
      }
      if (this.currentlyDisplayedProcessTree) {
        this.conformanceCheckingService.updateTreeConformance([v]);
      }
    }
  }

  handleConformanceRemove(v: Variant) {
    this.conformanceCheckingService.updateTreeConformance([], [v]);
  }
}

export namespace VariantExplorerComponent {
  export const componentName = 'VariantExplorerComponent';
}
