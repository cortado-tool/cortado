import { PolygonDrawingService } from 'src/app/services/polygon-drawing.service';
import { VariantFilterService } from './../../services/variantFilterService/variant-filter.service';
import { LazyLoadingServiceService } from 'src/app/services/lazyLoadingService/lazy-loading.service';

import { ProcessTreeService } from 'src/app/services/processTreeService/process-tree.service';
import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
import { BackendService } from './../../services/backendService/backend.service';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ComponentContainer, LogicalZIndex } from 'golden-layout';

import { DropzoneConfig } from '../drop-zone/drop-zone.component';
import * as d3 from 'd3';
import { ColorMapService } from 'src/app/services/colorMapService/color-map.service';
import { FormControl, FormGroup } from '@angular/forms';
import { Options } from '@angular-slider/ngx-slider';
import { animate, style, transition, trigger } from '@angular/animations';
import {
  AlignmentType,
  ConformanceCheckingService,
} from 'src/app/services/conformanceChecking/conformance-checking.service';
import {
  FrequentMiningAlgorithm,
  FrequentMiningCMStrategy,
  FrequentMiningStrategy,
  MiningConfig,
  SubvariantPattern,
  VariantSortKey,
} from '../../objects/Variants/variant-miner-types';
import { processTreesEqual } from 'src/app/objects/ProcessTree/utility-functions/process-tree-integrity-check';
import { LogService } from 'src/app/services/logService/log.service';
import { VariantService } from 'src/app/services/variantService/variant.service';
import { LayoutChangeDirective } from 'src/app/directives/layout-change/layout-change.directive';
import { VariantDrawerDirective } from 'src/app/directives/variant-drawer/variant-drawer.directive';
import { ProcessTree } from 'src/app/objects/ProcessTree/ProcessTree';
import { InfixType } from 'src/app/objects/Variants/infix_selection';
import { Variant } from 'src/app/objects/Variants/variant';
import {
  VariantElement,
  LeafNode,
  deserialize,
} from 'src/app/objects/Variants/variant_element';
import { contextMenuCallback } from '../variant-explorer/functions/variant-drawer-callbacks';
import { ImageExportService } from 'src/app/services/imageExportService/image-export-service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { VariantSorter } from 'src/app/objects/Variants/variant-sorter';
import { ContextMenuItem } from '../variant-explorer/variant-explorer-context-menu/variant-explorer-context-menu.component';

@Component({
  selector: 'app-variant-miner',
  templateUrl: './variant-miner.component.html',
  styleUrls: ['./variant-miner.component.scss'],
  animations: [
    trigger('collapse', [
      transition(':enter', [
        style({ opacity: '0', width: '0px', overflow: 'hidden' }),
        animate('250ms ease-in', style({ width: '*' })),
      ]),
      transition(':leave', [
        animate('250ms ease-in', style({ opacity: '0.4', width: '0px' })),
      ]),
    ]),
  ],
})
export class VariantMinerComponent
  extends LayoutChangeDirective
  implements OnInit, AfterViewInit, OnDestroy
{
  constructor(
    @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken)
    private container: ComponentContainer,
    private backendService: BackendService,
    private sharedDataService: SharedDataService,
    private colorMapService: ColorMapService,
    private conformanceCheckingService: ConformanceCheckingService,
    private processTreeService: ProcessTreeService,
    private lazyLoadingServiceService: LazyLoadingServiceService,
    private logService: LogService,
    private variantService: VariantService,
    private variantFilterService: VariantFilterService,
    private polygonDrawingService: PolygonDrawingService,
    private imageExportService: ImageExportService,
    elRef: ElementRef,
    renderer: Renderer2
  ) {
    super(elRef.nativeElement, renderer);

    const activitites = this.logService.activitiesInEventLog;

    for (let activity in activitites) {
      this.activityNames.push(activity);
      this.activityNames.sort();
      this.activityNamesFilter.set(activity, ActvitiyFilterState.Default);
    }
  }

  @ViewChildren(VariantDrawerDirective)
  variantDrawers: QueryList<VariantDrawerDirective>;

  @ViewChild('variantMiner', { static: false })
  variantMinerDiv: ElementRef<HTMLDivElement>;

  FrequentMiningStrategy = FrequentMiningStrategy;
  FrequentMiningAlgorithm = FrequentMiningAlgorithm;
  FrequentMiningCMStrategy = FrequentMiningCMStrategy;
  VariantSortKey = VariantSortKey;
  currentSortKey: VariantSortKey;

  currentHeight: number;
  private _destroy$ = new Subject();

  activityNames = [];
  activityNamesFilter: Map<string, ActvitiyFilterState> = new Map<
    string,
    ActvitiyFilterState
  >();
  processTree: ProcessTree = null;
  conformanceCheckedTree: ProcessTree = null;

  conformanceTimeout = 30;
  math = Math;

  maxSup: number;
  maxSize: number;
  nClosed: number;
  nValid: number;
  nMaximal: number;

  filterDropDownOpen: boolean = false;
  minerVisibile: boolean = true;

  contextMenu_xPos: number = 10;
  contextMenu_yPos: number = 10;
  contextMenu_element: VariantElement;
  contextMenu_variant: VariantElement;
  contextMenu_directive: VariantDrawerDirective;

  kFilter: IntervalFilter = new IntervalFilter('k', 2, 2, 1, 3, 15);
  supFilter: IntervalFilter = new IntervalFilter(
    'support',
    100,
    200,
    1,
    0,
    1000
  );
  idFilter: IntervalFilter = new IntervalFilter('id', 1, 2, 1, 0, 15);
  cpConfFilter: IntervalFilter = new IntervalFilter(
    'child_parent_confidence',
    0.1,
    0.2,
    0.01,
    0,
    1
  );
  supConfFilter: IntervalFilter = new IntervalFilter(
    'subpattern_confidence',
    0.1,
    0.2,
    0.01,
    0,
    1
  );

  openContextCallback = contextMenuCallback.bind(this);

  exportSVG = function () {
    let svgs: SVGGraphicsElement[] = [];
    let state: boolean[] = [];

    const visibleComponents = this.contextMenu_directive;
    svgs.push(visibleComponents.getSVGGraphicElement());

    svgs.forEach((svg) => {
      svg.removeAttribute('ng-reflect-variant');
      svg.removeAttribute('ng-reflect-on-click-cb-fc');
      svg.removeAttribute('ng-reflect-performance-mode');
      svg.removeAttribute('ng-reflect-compute-activity-color');
      svg.removeAttribute('appVariantDrawer');
      svg.removeAttribute('class');
      d3.select(svg).selectAll('text').attr('data-bs-original-title', null);
    });

    svgs.push(
      d3
        .select('#infixDotsForDrawer')
        .attr('width', 0)
        .attr('height', 0)
        .node() as SVGGraphicsElement
    );

    // Send all Elements to the export service
    this.imageExportService.export('variant_explorer', 0, 0, ...svgs);

    // Return everything to its previous state
    visibleComponents.forEach((c, i) => c.setExpanded(state[i]));
  }.bind(this);

  filterInfix = function () {
    const bids = this.displayedVariantsPatterns.filter(
      (v) => v.variant === this.contextMenu_variant
    )[0].bids;

    this.variantFilterService.addVariantFilter('infix filter', new Set(bids));
  }.bind(this);

  contextMenuOptions: Array<ContextMenuItem> = [
    new ContextMenuItem(
      'Use infix to filter concurrency variants',
      'bi-funnel-fill',
      this.filterInfix
    ),
    new ContextMenuItem('Export pattern as SVG', 'bi-save', this.exportSVG),
  ];

  currentConfig: MiningConfig = null;

  showControls: boolean = true;
  relSup = 25;

  supportSliderOptions: Options = {
    floor: 0,
    ceil: 100,
    step: 0.01,
    tickStep: 25,
    showSelectionBar: true,
    showTicks: true,
    translate: (value: number): string => {
      return +value.toFixed(1) + '%';
    },
  };

  closedMaximalChecks: Choice[] = [
    new Choice('Maximal', (p: SubvariantPattern) => {
      return p.maximal;
    }),
    new Choice('Closed', (p: SubvariantPattern) => {
      return p.closed;
    }),
    new Choice('Valid', (p: SubvariantPattern) => {
      return true;
    }),
  ];
  selClosedMaximal: string = 'Valid';

  infixChecks: Choice[] = [
    new Choice('Proper Infix', (p: SubvariantPattern) => {
      return p.infixType === InfixType.PROPER_INFIX;
    }),
    new Choice('Suffix', (p: SubvariantPattern) => {
      return p.infixType === InfixType.POSTFIX;
    }),
    new Choice('Prefix', (p: SubvariantPattern) => {
      return p.infixType === InfixType.PREFIX;
    }),
    new Choice('Variant', (p: SubvariantPattern) => {
      return p.infixType === InfixType.NOT_AN_INFIX;
    }),
  ];

  alignChecks: Choice[] = [
    new Choice('Fitting', (p: SubvariantPattern) => {
      return p.deviations > 0;
    }),
    new Choice('Not Fitting', (p: SubvariantPattern) => {
      return p.deviations > 0;
    }),
    new Choice('Unknown', (p: SubvariantPattern) => {
      return p.deviations > 0;
    }),
  ];

  infixFilterList = this.infixChecks.map((c) => c);
  alignmentFilterList = this.alignChecks.map((c) => c);
  closedMaxFilter: (p: SubvariantPattern) => boolean = (
    p: SubvariantPattern
  ) => {
    return true;
  };

  variantMinerOutOfFocus: boolean = false;

  ascending: boolean = false;
  minsup: number = 0;

  maxWidth: number = 0;

  variantMinerResults: any;
  colorMap;

  totalTraces: number;
  totalVariants: number;

  showOnlyClosed: boolean = false;
  showOnlyMaximal: boolean = false;

  variantPatterns: Array<SubvariantPattern> = new Array<SubvariantPattern>();
  displayedVariantsPatterns: Array<SubvariantPattern> =
    new Array<SubvariantPattern>();

  dropZoneConfig: any;
  variantMinerConfigInput: FormGroup;

  ngOnInit(): void {
    this.dropZoneConfig = new DropzoneConfig(
      '.xes',
      'false',
      'false',
      '<large> Import <strong>Event Log</strong> .xes file</large>'
    );

    this.subscribeForConformanceCheckingResults();

    const rel_sup = new FormControl(1000, {
      updateOn: 'change',
    });

    const min_sup = new FormControl(1000, {
      updateOn: 'change',
    });

    const frequent_mining_strat = new FormControl(
      this.FrequentMiningStrategy.TraceTransaction,
      {
        updateOn: 'change',
      }
    );

    this.variantMinerConfigInput = new FormGroup({
      size: new FormControl(20, {
        updateOn: 'change',
      }),

      min_sup,
      rel_sup,
      frequent_mining_strat,

      artifical_start: new FormControl(false, {
        updateOn: 'change',
      }),

      fold_loop: new FormControl(false, {
        updateOn: 'change',
      }),
      loop: new FormControl(2, {
        updateOn: 'change',
      }),

      frequent_mining_algo: new FormControl(
        this.FrequentMiningAlgorithm.ValidTreeMiner,
        {
          updateOn: 'change',
        }
      ),

      cm_tree_strategy: new FormControl(
        this.FrequentMiningCMStrategy.ClosedMaximal,
        {
          updateOn: 'change',
        }
      ),
    });

    rel_sup.valueChanges.subscribe((relSup) => {
      const min_sup_update =
        this.variantMinerConfigInput.value.frequent_mining_strat ===
          FrequentMiningStrategy.TraceTransaction ||
        this.variantMinerConfigInput.value.frequent_mining_strat ===
          FrequentMiningStrategy.TraceOccurence
          ? Math.round((relSup / 100) * this.totalTraces)
          : Math.round((relSup / 100) * this.totalVariants);

      min_sup.setValue(min_sup_update);
    });

    frequent_mining_strat.valueChanges.subscribe((strat) => {
      if (
        strat == FrequentMiningStrategy.VariantTransaction ||
        strat == FrequentMiningStrategy.TraceTransaction
      ) {
        this.supportSliderOptions = {
          floor: 0,
          ceil: 100,
          step: 0.01,
          tickStep: 25,
          showSelectionBar: true,
          showTicks: true,
          translate: (value: number): string => {
            return +value.toFixed(1) + '%';
          },
        };
      } else {
        this.supportSliderOptions = {
          floor: 0,
          ceil: 150,
          step: 0.01,
          tickStep: 25,
          showSelectionBar: true,
          showTicks: true,
          translate: (value: number): string => {
            return +value.toFixed(1) + '%';
          },
        };
      }
    });

    this.variantService.variants$.subscribe((variants) => {
      this.totalTraces = variants
        .map((variant) => {
          return variant.count;
        })
        .reduce((a: number, b: number) => a + b);
      this.totalVariants = variants.length;
    });
  }

  onSubmit() {
    console.log('SUBMIT', this.variantMinerConfigInput.value);

    const form_values = this.variantMinerConfigInput.value;

    let loop = 0;
    if (form_values.fold_loop) {
      loop = form_values.loop;
    }

    this.currentConfig = new MiningConfig(
      form_values.size,
      form_values.min_sup,
      form_values.frequent_mining_strat,
      loop,
      form_values.frequent_mining_algo,
      form_values.artifical_start
    );
    this.backendService.frequentSubtreeMining(this.currentConfig);

    this.minsup = form_values.min_sup;
  }

  handleFilterChange(event) {
    const pos = [];
    const neg = [];

    this.activityNamesFilter.forEach((v, k) => {
      switch (v) {
        case ActvitiyFilterState.In: {
          pos.push(k);
          break;
        }
        case ActvitiyFilterState.Out: {
          neg.push(k);
          break;
        }
      }
    });

    this.displayedVariantsPatterns = this.variantPatterns.filter((vp) => {
      let res = true;
      res = res && this.kFilter.apply(vp);
      res = res && this.supFilter.apply(vp);
      res = res && this.idFilter.apply(vp);
      res = res && this.cpConfFilter.apply(vp);
      res = res && this.supConfFilter.apply(vp);
      res = res && this.closedMaxFilter(vp);

      res = res && this.applyActivityNameFilter(vp, pos, neg);

      //res = res && this.alignmentFilterList.map(f => f.filterFnc(vp)).some(v => v)
      res =
        res && this.infixFilterList.map((f) => f.filterFnc(vp)).some((v) => v);

      return res;
    });

    this.sort(this.currentSortKey);
  }

  applyActivityNameFilter: (
    p: SubvariantPattern,
    pos: Array<string>,
    neg: Array<string>
  ) => boolean = (
    p: SubvariantPattern,
    pos: Array<string>,
    neg: Array<string>
  ) => {
    if (
      neg.some((a) => p.activities.has(a)) ||
      (pos.length > 0 && !pos.some((a) => p.activities.has(a)))
    ) {
      return false;
    }

    return true;
  };

  ngAfterViewInit(): void {
    this.logService.activitiesInEventLog$
      .pipe(takeUntil(this._destroy$))
      .subscribe((activities) => {
        this.activityNames = [];
        for (let activity in activities) {
          this.activityNames.push(activity);
          this.activityNames.sort();
          this.activityNamesFilter.set(activity, ActvitiyFilterState.Default);
        }
      });

    this.colorMapService.colorMap$
      .pipe(takeUntil(this._destroy$))
      .subscribe((cMap) => {
        this.colorMap = cMap;
      });

    this.logService.loadedEventLog$
      .pipe(takeUntil(this._destroy$))
      .subscribe((log) => {
        this.variantPatterns = [];
        this.displayedVariantsPatterns = [];
      });

    this.processTreeService.currentDisplayedProcessTree$
      .pipe(takeUntil(this._destroy$))
      .subscribe((tree) => {
        this.processTree = tree;

        const treeHasChanged = !processTreesEqual(
          this.conformanceCheckedTree,
          this.processTree
        );

        if (treeHasChanged) {
          this.variantPatterns.forEach((v) => {
            v.isConformanceOutdated = true;
          });
        }
      });

    this.backendService
      .getConfiguration()
      .pipe(takeUntil(this._destroy$))
      .subscribe((config) => {
        this.conformanceTimeout =
          config.timeoutCVariantAlignmentComputation + 30;
      });

    this.sharedDataService.frequentMiningResults$
      .pipe(takeUntil(this._destroy$))
      .subscribe((res) => {
        if (res) {
          this.variantPatterns = new Array<SubvariantPattern>();

          res.forEach((p, i) => {
            if (p.valid) {
              const variant: VariantElement = deserialize(p.obj);
              const [isPrefix, isSuffix] = this.checkInfix(p.obj);
              let infixtype: InfixType;

              if (isPrefix && isSuffix) {
                infixtype = InfixType.NOT_AN_INFIX;
              } else if (isPrefix) {
                infixtype = InfixType.PREFIX;
              } else if (isSuffix) {
                infixtype = InfixType.POSTFIX;
              } else {
                infixtype = InfixType.PROPER_INFIX;
              }
              const k = p.k - (+isSuffix + +isPrefix);

              variant.setExpanded(true);

              const pattern = new SubvariantPattern(
                i,
                k,
                variant,
                p.sup,
                p.child_parent_confidence,
                p.subpattern_confidence,
                p.cross_support_confidence,
                p.maximal,
                p.valid,
                p.closed,
                infixtype,
                p.bids
              );

              pattern.isConformanceOutdated = true;
              pattern.isTimeouted = false;

              this.variantPatterns.push(pattern);
            }
          });

          this.maxSup = Math.max(...this.variantPatterns.map((v) => v.support));
          this.minsup = Math.min(...this.variantPatterns.map((v) => v.support));
          this.maxSize = Math.max(...this.variantPatterns.map((v) => v.size));
          this.nClosed = this.variantPatterns.filter((v) => v.closed).length;
          this.nValid = this.variantPatterns.filter((v) => v.valid).length;
          this.nMaximal = this.variantPatterns.filter((v) => v.maximal).length;

          this.maxWidth = Math.max(
            ...this.variantPatterns.map((v) => v.variant.getWidth(false))
          );

          this.set_interval_filter_configs();
          this.displayedVariantsPatterns = this.variantPatterns;
        } else {
          this.variantPatterns = [];
          this.displayedVariantsPatterns = this.variantPatterns;

          this.maxSup = 0;
          this.maxSize = 0;
          this.nClosed = 0;
          this.nValid = 0;
          this.nMaximal = 0;
        }
      });
  }

  checkInfix(obj) {
    if ('follows' in obj) {
      const isPrefix = 'start' in obj['follows'][0];
      const isSuffix = 'end' in obj['follows'][obj['follows'].length - 1];
      return [isPrefix, isSuffix];
    }
    return [false, false];
  }

  sort(key: VariantSortKey) {
    if (this.currentSortKey == key) {
      this.ascending = !this.ascending;
    } else {
      this.ascending = false;
    }

    this.displayedVariantsPatterns = VariantSorter.sort(
      this.displayedVariantsPatterns,
      key,
      this.ascending
    ) as SubvariantPattern[];
    this.currentSortKey = key;
  }

  private set_interval_filter_configs() {
    this.kFilter.set_config(3, this.maxSize);
    this.supFilter.set_config(
      this.minsup,
      this.maxSup,
      Math.round((this.maxSup - this.minsup) / 10),
      Math.round((this.maxSup - this.minsup) / 20)
    );
    this.idFilter.set_config(0, this.variantPatterns.length);
    this.cpConfFilter.set_config(0, 1);
    this.supConfFilter.set_config(0, 1);

    this.resetClosedMaximalFilter();
    this.resetAlignFilter();
    this.resetInfixFilter();
  }

  exportVariantMiner() {
    let svgs: SVGGraphicsElement[] = [];
    let state: boolean[] = [];

    const visibleComponents = this.variantDrawers;

    // Get current expansion state
    visibleComponents.forEach((c) => state.push(c.isExpanded()));

    // Expand the elements and redraw them
    visibleComponents.forEach((c) => c.setExpanded(true));

    // Collect the SVG and pass them to the SVG Service
    visibleComponents.forEach((c) => svgs.push(c.getSVGGraphicElement()));

    // TODO Create the Legend Element and add it
    const legend = d3.create('svg').attr('x', '10').attr('y', '10');

    let leafnodes: LeafNode[] = [];

    for (let activity in this.logService.activitiesInEventLog) {
      leafnodes.push(new LeafNode([activity]));
    }

    svgs.forEach((svg) => {
      svg.removeAttribute('ng-reflect-variant');
      svg.removeAttribute('ng-reflect-on-click-cb-fc');
      svg.removeAttribute('ng-reflect-performance-mode');
      svg.removeAttribute('ng-reflect-compute-activity-color');
      svg.removeAttribute('appVariantDrawer');
      svg.removeAttribute('class');
      d3.select(svg).selectAll('text').attr('data-bs-original-title', null);
    });

    this.polygonDrawingService.drawLegend(leafnodes, legend, this.colorMap);

    svgs.unshift(legend.node());
    svgs.push(
      d3
        .select('#infixDotsForDrawer')
        .attr('width', 0)
        .attr('height', 0)
        .node() as SVGGraphicsElement
    );

    // Send all Elements to the export service
    this.imageExportService.export('variant_explorer', 0, 0, ...svgs);

    // Return everything to its previous state
    visibleComponents.forEach((c, i) => c.setExpanded(state[i]));

    // Hide the Spinner
  }

  handleActivityButtonClick(e) {
    const state = this.activityNamesFilter.get(e.activityName);
    let nextState;

    switch (state) {
      case ActvitiyFilterState.Default: {
        nextState = ActvitiyFilterState.In;
        d3.select(e.svg).classed('activity-button-in', true);
        break;
      }

      case ActvitiyFilterState.Out: {
        nextState = ActvitiyFilterState.Default;
        d3.select(e.svg).classed('activity-button-out', false);
        break;
      }

      case ActvitiyFilterState.In: {
        nextState = ActvitiyFilterState.Out;
        d3.select(e.svg).classed('activity-button-in', false);
        d3.select(e.svg).classed('activity-button-out', true);
        break;
      }
      default:
        nextState = ActvitiyFilterState.Default;
        break;
    }

    this.activityNamesFilter.set(e.activityName, nextState);

    this.handleFilterChange(null);
  }

  computeActivityColor = (
    self: VariantDrawerDirective,
    element: VariantElement,
    variant: Variant
  ) => {
    let color;

    if (element instanceof LeafNode) {
      color = this.colorMap.get(element.asLeafNode().activity[0]);

      if (element.activity.length > 1) {
        color = '#d3d3d3'; // lightgray
      }
    } else {
      color = '#d3d3d3';
    }

    return color;
  };

  handleResponsiveChange(
    left: number,
    top: number,
    width: number,
    height: number
  ): void {
    this.currentHeight = height;
  }

  handleVisibilityChange(visibility: boolean): void {
    this.minerVisibile = visibility;
    console.log('Visibility', visibility);
  }

  handleZIndexChange(
    logicalZIndex: LogicalZIndex,
    defaultZIndex: string
  ): void {}

  toggleBlur(event) {
    this.variantMinerOutOfFocus = event;
  }

  computeAlignments() {
    console.log('Requested Alignment!');
    this.displayedVariantsPatterns.forEach((pattern) =>
      this.updateConformanceForVariant(pattern, this.conformanceTimeout)
    );

    this.conformanceCheckedTree = this.processTree;
  }

  onCheckRadioChange(desc, func) {
    this.selClosedMaximal = desc;
    this.closedMaxFilter = func;
  }

  resetClosedMaximalFilter() {
    this.closedMaximalChecks = [
      new Choice('Maximal', (p: SubvariantPattern) => {
        return p.maximal;
      }),
      new Choice('Closed', (p: SubvariantPattern) => {
        return p.closed;
      }),
      new Choice('Valid', (p: SubvariantPattern) => {
        return true;
      }),
    ];
    this.selClosedMaximal = 'Valid';
    this.closedMaxFilter = (p: SubvariantPattern) => {
      return true;
    };
  }

  resetAlignFilter() {
    this.alignmentFilterList = this.alignChecks.map((c) => c);
  }

  resetInfixFilter() {
    this.infixFilterList = this.infixChecks.map((c) => c);
  }

  onCheckChange(event, fList: Array<any>, choice) {
    /* Selected */
    if (event.target.checked) {
      fList.push(choice);
    } else {
      fList.forEach((c, i) => {
        if (c.desc === choice.desc) fList.splice(i, 1);
      });
    }
  }

  updateConformanceForVariant(
    pattern: SubvariantPattern,
    timeout: number
  ): void {
    this.processTreeService.currentDisplayedProcessTree !== null;
    //variant.calculationInProgress = true;
    //variant.deviation = undefined;

    const resubscribe = this.conformanceCheckingService.calculateConformance(
      pattern.id.toLocaleString(),
      pattern.infixType,
      this.processTreeService.currentDisplayedProcessTree,
      pattern.variant.serialize(this.currentConfig.loop),
      timeout,
      AlignmentType.PatternAlignment
    );

    if (resubscribe) {
      this.subscribeForConformanceCheckingResults();
    }
  }

  subscribeForConformanceCheckingResults(): void {
    this.conformanceCheckingService.patternResults.subscribe(
      (res) => {
        const pattern = this.variantPatterns.find(
          (p) => p.id.toLocaleString() == res.id
        );
        pattern.calculationInProgress = false;
        pattern.isTimeouted = res.isTimeout;
        pattern.isConformanceOutdated = res.isTimeout;

        if (!res.isTimeout) {
          pattern.deviations = res.deviations;
        }
      },
      (_) => {
        this.variantPatterns.forEach((p) => {
          p.calculationInProgress = false;
          p.alignment = undefined;
          p.deviations = undefined;
        });
      }
    );
  }

  ngOnDestroy(): void {
    this.sharedDataService.frequentMiningResults = null;
    this.lazyLoadingServiceService.destoryVariantMinerObserver();
    this._destroy$.next();
  }
}

export namespace VariantMinerComponent {
  export const componentName = 'VariantMinerComponent';
}

export class IntervalFilter {
  apply(p: SubvariantPattern) {
    return (
      !p[this.attr] || (p[this.attr] >= this.low && p[this.attr] <= this.high)
    );
  }

  low: number;
  high: number;
  config: Options;
  attr: string;
  tickStep: number;
  tickValueStep: number;
  step: number;
  defaultLow: number;
  defaultHigh: number;

  set_config(floor, ceil, tickStep?, tickValueStep?) {
    this.tickStep = tickStep ? tickStep : this.tickStep;
    this.tickValueStep = tickValueStep ? tickValueStep : this.tickStep;

    this.config = {
      floor: floor,
      ceil: ceil,
      draggableRange: true,
      showTicksValues: true,
      tickStep: this.tickStep,
      tickValueStep: this.tickValueStep,
      step: this.step,
    };
    3;

    this.defaultLow = floor;
    this.defaultHigh = ceil;

    this.low = floor;
    this.high = ceil;
  }

  reset_filter() {
    this.low = this.defaultLow;
    this.high = this.defaultHigh;
  }

  touched() {
    return this.low !== this.defaultLow || this.high !== this.defaultHigh;
  }

  constructor(
    attr,
    tickStep: number,
    tickValueStep: number,
    step: number,
    defaultLow: number,
    defaultHigh: number
  ) {
    this.attr = attr;
    this.tickStep = tickStep;
    this.tickValueStep = tickValueStep;
    this.step = step;

    this.set_config(defaultLow, defaultHigh);
  }
}

export class Choice {
  desc: string;
  filterFnc: (p: SubvariantPattern) => boolean;

  constructor(desc: string, filterFnc: (p: SubvariantPattern) => boolean) {
    this.desc = desc;
    this.filterFnc = filterFnc;
  }
}

enum ActvitiyFilterState {
  In = 1,
  Out = 2,
  Default = 3,
}
