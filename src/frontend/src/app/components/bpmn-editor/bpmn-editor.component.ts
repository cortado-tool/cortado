import { ProcessTreeService } from './../../services/processTreeService/process-tree.service';
import { Subject } from 'rxjs';
import { ColorMapService } from 'src/app/services/colorMapService/color-map.service';
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  Renderer2,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import * as d3 from 'd3';
import { ComponentContainer, LogicalZIndex } from 'golden-layout';

import {
  ProcessTree,
  ProcessTreeOperator,
} from 'src/app/objects/ProcessTree/ProcessTree';
import { ModelPerformanceColorScaleService } from 'src/app/services/performance-color-scale.service';
import { ImageExportService } from 'src/app/services/imageExportService/image-export-service';
import { PerformanceService } from 'src/app/services/performance.service';
import { LayoutChangeDirective } from 'src/app/directives/layout-change/layout-change.directive';
import { BPMN_Constant } from 'src/app/constants/bpmn_model_drawer_constants';
import { BpmnDrawerDirective } from 'src/app/directives/bpmn-drawer/bpmn-drawer.directive';
import { getPerformanceTable } from '../process-tree-editor/utils';
import { textColorForBackgroundColor } from 'src/app/utils/render-utils';
import { NodeSeletionStrategy } from 'src/app/objects/ProcessTree/utility-functions/process-tree-edit-tree';
import { takeUntil } from 'rxjs/operators';
import { ModelViewModeService } from 'src/app/services/viewModeServices/model-view-mode.service';
import { ViewMode } from 'src/app/objects/ViewMode';
import { ConformanceCheckingService } from 'src/app/services/conformanceChecking/conformance-checking.service';

@Component({
  selector: 'app-bpmn-editor',
  templateUrl: './bpmn-editor.component.html',
  styleUrls: ['./bpmn-editor.component.css'],
})
export class BpmnEditorComponent
  extends LayoutChangeDirective
  implements OnInit, AfterViewInit, OnDestroy
{
  selectedNode: any;
  currentTree: ProcessTree;

  activityColorMap: Map<string, string>;
  performanceColorMap: Map<number, any>;

  nodeWidthCache = new Map<string, number>();
  selectedRootID: number;

  @ViewChild('bpmn') svgElem: ElementRef;
  @ViewChild('BPMNcontainer') bpmnContainerElem: ElementRef;
  @ViewChild(BpmnDrawerDirective) bpmnDrawer: BpmnDrawerDirective;

  mainGroup: d3.Selection<SVGGElement, any, any, any>;
  selectedStatistic: string;
  selectedPerformanceIndicator: string;
  zoom: d3.ZoomBehavior<Element, unknown>;

  NodeSeletionStrategy = NodeSeletionStrategy;
  nodeSelectionStrategy: NodeSeletionStrategy = NodeSeletionStrategy.TREE;
  treeCacheLength: number = 0;
  treeCacheIndex: number = 0;

  private _destroy$ = new Subject();

  constructor(
    @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken)
    private container: ComponentContainer,
    elRef: ElementRef,
    private renderer: Renderer2,
    private colorMapService: ColorMapService,
    private performanceColorScaleService: ModelPerformanceColorScaleService,
    private performanceService: PerformanceService,
    private processTreeService: ProcessTreeService,
    private imageExportService: ImageExportService,
    private modelViewModeService: ModelViewModeService,
    private conformanceCheckingService: ConformanceCheckingService
  ) {
    super(elRef.nativeElement, renderer);
    const state = this.container.initialState;
  }

  ngOnInit(): void {
    this.processTreeService.nodeWidthCache$
      .pipe(takeUntil(this._destroy$))
      .subscribe((cache) => {
        this.nodeWidthCache = cache;
      });

    this.processTreeService.treeCacheIndex$
      .pipe(takeUntil(this._destroy$))
      .subscribe((idx) => {
        this.treeCacheIndex = idx;
      });

    this.processTreeService.treeCacheLength$
      .pipe(takeUntil(this._destroy$))
      .subscribe((len) => {
        this.treeCacheLength = len;
      });

    this.processTreeService.selectionMode$
      .pipe(takeUntil(this._destroy$))
      .subscribe((strategy) => {
        this.nodeSelectionStrategy = strategy;
      });
  }

  ngAfterViewInit(): void {
    this.nodeWidthCache = this.processTreeService.nodeWidthCache;
    this.selectedStatistic =
      this.performanceColorScaleService.selectedColorScale.statistic;
    this.selectedPerformanceIndicator =
      this.performanceColorScaleService.selectedColorScale.performanceIndicator;

    this.modelViewModeService.viewMode$
      .pipe(takeUntil(this._destroy$))
      .subscribe((viewMode) => {
        if (this.currentTree) {
          this.redraw(this.currentTree);
        }
      });

    this.conformanceCheckingService.isConformanceWeighted$
      .pipe(takeUntil(this._destroy$))
      .subscribe((_) => {
        if (this.currentTree) {
          this.redraw(this.currentTree);
        }
      });

    this.mainGroup = d3.select('#bpmn-zoom-group');

    this.createArrowHeadMarker();

    this.addZoomFunctionality();
    this.centerContent();

    this.colorMapService.colorMap$
      .pipe(takeUntil(this._destroy$))
      .subscribe((colorMap) => {
        this.activityColorMap = colorMap;

        if (this.currentTree) {
          this.redraw(this.currentTree);
        }
      });

    this.performanceColorScaleService.currentColorScale
      .pipe(takeUntil(this._destroy$))
      .subscribe((colorMap) => {
        if (colorMap && colorMap != this.performanceColorMap) {
          this.performanceColorMap = colorMap;

          if (this.currentTree) {
            this.redraw(this.currentTree);
          }
        }
      });

    this.processTreeService.currentDisplayedProcessTree$
      .pipe(takeUntil(this._destroy$))
      .subscribe((tree) => {
        this.currentTree = tree;
        this.redraw(tree);
      });

    this.processTreeService.selectedRootNodeID$
      .pipe(takeUntil(this._destroy$))
      .subscribe((id) => {
        if (id) {
          this.selectBPMNNode(id);
        } else {
          this.unselectAll();
        }

        this.selectedRootID = id;
      });
  }

  selectNodeCallBack = (self, event: PointerEvent, d) => {
    event.stopPropagation();
    event.preventDefault();

    if (d.id === this.selectedRootID) {
      this.processTreeService.selectedRootNodeID = null;
      this.processTreeService.selectedTree = undefined;
    } else {
      this.processTreeService.selectedRootNodeID = d.id;
      this.processTreeService.selectedTree = ProcessTree.fromObj(d);
    }
  };

  createArrowHeadMarker() {
    d3.select(this.svgElem.nativeElement)
      .append('svg:defs')
      .append('svg:marker')
      .attr('id', 'arrow-grey')
      .attr('refX', 3)
      .attr('refY', 3)
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('orient', 'auto')
      .attr('markerUnits', 'strokeWidth')
      .append('path')
      .attr('d', 'M 0 0 6 3 0 6 1.5 3')
      .attr('fill', BPMN_Constant.STROKE_COLOR);

    d3.select(this.svgElem.nativeElement)
      .append('svg:defs')
      .append('svg:marker')
      .attr('id', 'arrow-red')
      .attr('refX', 3)
      .attr('refY', 3)
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('orient', 'auto')
      .attr('markerUnits', 'strokeWidth')
      .append('path')
      .attr('d', 'M 0 0 6 3 0 6 1.5 3')
      .attr('fill', 'red');

    d3.select(this.svgElem.nativeElement)
      .append('svg:defs')
      .append('svg:marker')
      .attr('id', 'arrow-frozen')
      .attr('refX', 3)
      .attr('refY', 3)
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('orient', 'auto')
      .attr('markerUnits', 'strokeWidth')
      .append('path')
      .attr('d', 'M 0 0 6 3 0 6 1.5 3')
      .attr('fill', '#425bbf');
  }

  redraw(tree: ProcessTree) {
    this.bpmnDrawer.redraw(tree);
    this.selectBPMNNode(this.selectedRootID);
  }

  tooltipContent = (d: ProcessTree) => {
    if (d.hasPerformance() && d.label !== ProcessTreeOperator.tau) {
      return (
        `<div style="display: flex; justify-content: space-between" class="performance-tooltip-header-style bg-dark">
        <h6 style="flex: 1" class="performance-tooltip-header">` +
        (d.label || d.operator) +
        `</h6>
      </div>` +
        getPerformanceTable(
          d.performance,
          this.selectedPerformanceIndicator,
          this.selectedStatistic
        )
      );
    }
    return d.label || d.operator;
  };

  computeNodeColor = (pt: ProcessTree) => {
    let color;

    switch (this.modelViewModeService.viewMode) {
      case ViewMode.CONFORMANCE:
        if (pt.conformance === null) return '#404041';
        return this.conformanceCheckingService.conformanceColorMap.getColor(
          this.conformanceCheckingService.isConformanceWeighted &&
            pt.conformance.weighted_by_counts != undefined
            ? pt.conformance.weighted_by_counts.value
            : pt.conformance.weighted_equally.value
        );
      case ViewMode.PERFORMANCE:
        if (
          this.performanceColorMap.has(pt.id) &&
          pt.performance?.[this.selectedPerformanceIndicator]?.[
            this.selectedStatistic
          ] !== undefined
        ) {
          color = this.performanceColorMap
            .get(pt.id)
            .getColor(
              pt.performance[this.selectedPerformanceIndicator][
                this.selectedStatistic
              ]
            );
        } else {
          color = '#404040';
        }

        break;
      default:
        color =
          pt.label !== '\u03C4'
            ? this.activityColorMap.get(pt.label)
            : BPMN_Constant.INVISIBLE_ACTIVITIY_DEFAULT_COLOR;
        break;
    }

    return color;
  };

  computeTextColor = (pt: ProcessTree) => {
    return pt.label === ProcessTreeOperator.tau || pt.frozen
      ? 'White'
      : textColorForBackgroundColor(this.computeNodeColor(pt));
  };

  ngOnDestroy() {
    this._destroy$.next();
  }

  unselectAll() {
    this.mainGroup.classed('selected-bpmn-operator', false);

    this.mainGroup
      .selectAll('.selected-bpmn-event')
      .classed('selected-bpmn-event', false);
    this.mainGroup
      .selectAll('.selected-bpmn-operator')
      .classed('selected-bpmn-operator', false);
  }

  freezeSubtree() {
    this.processTreeService.freezeSubtree(this.selectedNode.datum());
  }

  buttonFreezeSubtreeDisabled() {
    return (
      this.selectedRootID == null ||
      (this.selectedNode && this.selectedNode.datum().children.length === 0)
    );
  }

  selectBPMNNode(id: number) {
    this.unselectAll();

    const selected_node = this.mainGroup.select('[id="' + id + '"]');
    if (!selected_node.empty()) {
      this.selectedNode = selected_node;
      if ((selected_node.datum() as ProcessTree).operator) {
        if (this.currentTree === selected_node.datum()) {
          this.mainGroup.classed('selected-bpmn-operator', true);
        } else {
          selected_node.classed('selected-bpmn-operator', true);
        }
      } else {
        selected_node.classed('selected-bpmn-event', true);
      }
    }
  }

  selectNode(): void {
    this.processTreeService.selectedRootNodeID = null;
    this.processTreeService.selectionMode = NodeSeletionStrategy.NODE;
  }

  selectSubtree(): void {
    this.processTreeService.selectedRootNodeID = null;
    this.processTreeService.selectionMode = NodeSeletionStrategy.TREE;
  }

  undo(): void {
    this.processTreeService.undo();
  }

  redo(): void {
    this.processTreeService.redo();
  }

  handleResponsiveChange(
    left: number,
    top: number,
    width: number,
    height: number
  ): void {}

  handleVisibilityChange(visibile: boolean): void {
    if (this.currentTree && visibile) {
      this.reset_zoom(false);
      this.redraw(this.currentTree);
    }
  }

  handleZIndexChange(
    logicalZIndex: LogicalZIndex,
    defaultZIndex: string
  ): void {}

  clearSelection() {
    this.processTreeService.selectedRootNodeID = null;
  }

  deleteSelected() {
    this.processTreeService.deleteSelected(this.selectedNode.datum());
  }

  deleteInactive() {
    return (
      this.selectedRootID == null ||
      (this.nodeSelectionStrategy == this.NodeSeletionStrategy.NODE &&
        this.selectedNode &&
        this.selectedNode.datum().children.length > 0)
    );
  }

  addZoomFunctionality(): void {
    this.mainGroup.attr(
      'transform',
      `translate(${
        3 * BPMN_Constant.HORIZONTALSPACING + 2 * BPMN_Constant.START_END_RADIUS
      }, ${this.bpmnContainerElem.nativeElement.offsetHeight / 2})`
    );

    const zooming = function (event) {
      this.mainGroup.attr(
        'transform',
        event.transform.translate(
          3 * BPMN_Constant.HORIZONTALSPACING +
            2 * BPMN_Constant.START_END_RADIUS,
          this.bpmnContainerElem.nativeElement.offsetHeight / 2
        )
      );
    }.bind(this);

    this.zoom = d3.zoom().scaleExtent([0.1, 3]).on('zoom', zooming);
    d3.select(this.svgElem.nativeElement)
      .call(this.zoom)
      .on('dblclick.zoom', null);
  }

  reset_zoom(animation: boolean = true): void {
    const rTime = animation ? 250 : 0;

    d3.select(this.svgElem.nativeElement)
      .transition()
      .duration(rTime)
      .ease(d3.easeExpInOut)
      .call(
        this.zoom.transform,
        d3.zoomIdentity.translate(
          3 * BPMN_Constant.HORIZONTALSPACING +
            2 * BPMN_Constant.START_END_RADIUS,
          0
        )
      );
  }

  centerContent(): void {}

  exportBPMN(svg: SVGGraphicsElement): void {
    // Copy the current tree
    const bpmn_copy = svg.cloneNode(true) as SVGGraphicsElement;
    const svgBBox = (this.mainGroup.node() as SVGGraphicsElement).getBBox();

    // Strip all the classed information
    const bpmn = d3.select(bpmn_copy);

    bpmn
      .selectAll('g')
      .attr('data-bs-toggle', 'none')
      .attr('data-bs-placement', 'none')
      .attr('data-bs-title', 'none')
      .attr('data-bs-html', 'none')
      .attr('data-bs-template', 'none');

    bpmn
      .select('#bpmn-zoom-group')
      .attr(
        'transform',
        `translate(${
          3 * BPMN_Constant.HORIZONTALSPACING +
          2 * BPMN_Constant.START_END_RADIUS
        }, ${2 * BPMN_Constant.VERTICALSPACING})`
      );

    // Export the BPMN
    this.imageExportService.export(
      'bpmn_diagram',
      svgBBox.width +
        5 * BPMN_Constant.HORIZONTALSPACING +
        4 * BPMN_Constant.START_END_RADIUS,
      svgBBox.height + 4 * BPMN_Constant.VERTICALSPACING,
      bpmn_copy
    );
  }
}

export namespace BpmnEditorComponent {
  export const componentName = 'BpmnEditorComponent';
}
