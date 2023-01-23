import { VARIANT_Constants } from '../../../../../constants/variant_element_drawer_constants';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import * as d3 from 'd3';
import { Selection } from 'd3';
import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
import { ColorMapService } from 'src/app/services/colorMapService/color-map.service';

import { VariantPerformanceService } from 'src/app/services/variant-performance.service';
import { SubvariantVisualization } from 'src/app/objects/Variants/subvariant';
import { VariantViewModeService } from 'src/app/services/viewModeServices/variant-view-mode.service';
import { ViewMode } from 'src/app/objects/ViewMode';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  LeafNode,
  ParallelGroup,
  SequenceGroup,
  VariantElement,
} from 'src/app/objects/Variants/variant_element';

@Component({
  selector: 'app-sub-variant',
  templateUrl: './sub-variant.component.html',
  styleUrls: ['./sub-variant.component.scss'],
})
export class SubVariantComponent implements AfterViewInit, OnDestroy {
  @ViewChild('svg')
  svgElement: ElementRef;

  @Input()
  set variant(value) {
    this._variant = value;
    if (this.isLoaded) {
      this.draw();
    }
  }

  private _variant;

  @Input()
  private expanded = false;

  @Input()
  onClickCbFc: (SubvariantVisualization) => void;

  @Input()
  private mainVariant: VariantElement;

  private isLoaded = false;

  svg: Selection<any, any, any, any>;
  public colorMap: Map<string, string>;
  public serviceTimeColorMap: any;
  public waitingTimeColorMap: any;

  private _destroy$ = new Subject();

  constructor(
    private sharedDataService: SharedDataService,
    private colorMapService: ColorMapService,
    private variantPerformanceService: VariantPerformanceService,
    private variantViewModeService: VariantViewModeService
  ) {
    this.serviceTimeColorMap =
      variantPerformanceService.serviceTimeColorMap.getValue();
    this.waitingTimeColorMap =
      variantPerformanceService.waitingTimeColorMap.getValue();
  }

  ngAfterViewInit(): void {
    this.svg = d3.select(this.svgElement.nativeElement);
    this.isLoaded = true;
    this.expanded =
      this.variantViewModeService.viewMode == ViewMode.PERFORMANCE;

    this.colorMapService.colorMap$
      .pipe(takeUntil(this._destroy$))
      .subscribe((cMap) => {
        this.colorMap = cMap;
        if (this._variant) {
          this.draw();
        }
      });

    this.variantPerformanceService.serviceTimeColorMap
      .pipe(takeUntil(this._destroy$))
      .subscribe((colorMap) => {
        if (colorMap !== undefined) {
          this.serviceTimeColorMap = colorMap;
          this.draw();
        }
      });

    this.variantPerformanceService.waitingTimeColorMap
      .pipe(takeUntil(this._destroy$))
      .subscribe((colorMap) => {
        if (colorMap !== undefined) {
          this.waitingTimeColorMap = colorMap;
          this.draw();
        }
      });

    this.variantViewModeService.viewMode$
      .pipe(takeUntil(this._destroy$))
      .subscribe((viewMode: ViewMode) => {
        this.draw();
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  draw(textColor: string = 'whitesmoke'): void {
    const intervalWidth = !this.expanded
      ? VARIANT_Constants.INTERVAL_LENGTH
      : VARIANT_Constants.INTERVAL_LENGTH * 1.5;

    this.svg.selectAll('g').remove();
    this.svg.selectAll('rect').remove();
    this.svg.selectAll('line').remove();

    const [data, xValues] = this.buildData();
    let dataArray = Array.from(data.values());

    const xScale = (x) =>
      VARIANT_Constants.POINT_RADIUS + x * intervalWidth + 5;
    const yScale = (y) =>
      4 * VARIANT_Constants.POINT_RADIUS +
      y * VARIANT_Constants.LEAF_HEIGHT * 1.5;

    const maxYIndex = Math.max(...dataArray.map((d) => d.yIndex));
    const maxXEnd = Math.max(...dataArray.map((d) => d.xEnd));

    const height = yScale(maxYIndex + 1);
    const width = xScale(maxXEnd) + VARIANT_Constants.POINT_RADIUS + 5;

    this.svg.attr('height', height);
    this.svg.attr('width', width);

    const helpLineOpacity =
      this.variantViewModeService.viewMode === ViewMode.PERFORMANCE
        ? 0.1
        : 0.04;

    this.svg
      .selectAll('line')
      .data(xValues)
      .enter()
      .append('line')
      .attr('x1', (x) => xScale(x))
      .attr('x2', (x) => xScale(x))
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', 'lightgrey')
      .attr('stroke-width', 2 * VARIANT_Constants.POINT_RADIUS)
      .attr('stroke-opacity', helpLineOpacity);

    if (this.variantViewModeService.viewMode === ViewMode.PERFORMANCE) {
      dataArray = dataArray.concat(this.buildWaitingTimeData(data));

      this.svg
        .append('rect')
        .classed('subvariant-rect', true)
        .datum(() => {
          let d = new SubvariantVisualization();
          d.activity = 'GLOBAL';
          d.performanceStats = this._variant.global_performance_stats;

          return d;
        })
        .style('fill', (d) => 'lightgrey')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height)
        .attr('fill-opacity', 0.5)
        .attr('rx', 8)
        .attr('ry', 8)
        .on('click', (_, d) => {
          if (this.onClickCbFc) {
            this.onClickCbFc(d);
          }

          this.variantPerformanceService.setPerformanceStatsSelectedVariantElement(
            d.performanceStats,
            !d.isWaitingTimeNode
          );
        });
    }

    const g = this.svg.selectAll().data(dataArray).join('g');

    g.append('rect')
      .classed('subvariant-rect', true)
      .style('fill', (d) => this.computeActivityColor(d))
      .attr('x', (d) => xScale(d.xStart) - VARIANT_Constants.POINT_RADIUS)
      .attr('y', (d) => yScale(d.yIndex) - VARIANT_Constants.POINT_RADIUS)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr(
        'width',
        (d) =>
          xScale(d.xEnd) - xScale(d.xStart) + 2 * VARIANT_Constants.POINT_RADIUS
      )
      .attr('height', VARIANT_Constants.POINT_RADIUS * 2)
      .attr('data-bs-toggle', (d) => {
        if (d.isWaitingTimeNode) return null;
        return 'tooltip';
      })
      .attr('title', (d) => d.activity)
      .on('click', (_, d) => {
        if (this.onClickCbFc) {
          this.onClickCbFc(d);
        }

        this.variantPerformanceService.setPerformanceStatsSelectedVariantElement(
          d.performanceStats,
          !d.isWaitingTimeNode
        );
      });

    const texts = g
      .append('text')
      .filter((d) => !d.isWaitingTimeNode)
      .attr('x', (d) => xScale(d.xStart + (d.xEnd - d.xStart) / 2))
      .attr('y', (d) => yScale(d.yIndex) - VARIANT_Constants.POINT_RADIUS - 5)
      .style('text-anchor', 'middle')
      .style('fill', textColor)
      .text((d) => d.activity);

    texts.each((a, b, c) => {
      const sel = d3.select(c[b]);
      const xStart = xScale(a.xStart);
      const xEnd = xScale(a.xEnd);
      this.wrapInnerLabelText(
        sel,
        sel.text(),
        xEnd - xStart - 2 * VARIANT_Constants.POINT_RADIUS
      );
    });
  }

  private computeActivityColor(subvariantData: SubvariantVisualization) {
    switch (this.variantViewModeService.viewMode) {
      case ViewMode.STANDARD:
        return this.colorMap.get(subvariantData.activity);
      case ViewMode.PERFORMANCE:
        if (!subvariantData.isWaitingTimeNode) {
          let stat = this.variantPerformanceService.serviceTimeStatistic;
          return this.serviceTimeColorMap.getColor(
            subvariantData.performanceStats[stat]
          );
        }

        let stat = this.variantPerformanceService.waitingTimeStatistic;
        return this.waitingTimeColorMap.getColor(
          subvariantData.performanceStats[stat]
        );
      default:
        return this.colorMap.get(subvariantData.activity);
    }
  }

  private wrapInnerLabelText(
    textSelection: Selection<any, any, any, any>,
    text: string,
    maxWidth: number
  ): boolean {
    const originalText = text;
    let textLength = this.getComputedTextLength(textSelection);
    let truncated = false;
    while (textLength > maxWidth && text.length > 1) {
      text = text.slice(0, -1);
      textSelection.text(text + '..');
      textLength = this.getComputedTextLength(textSelection);
      truncated = true;
    }

    textSelection.attr('data-bs-toggle', 'tooltip').attr('title', originalText);
    return truncated;
  }

  private getComputedTextLength(
    textSelection: Selection<any, any, any, any>
  ): number {
    let textLength;
    if (
      this.sharedDataService.computedTextLengthCache.has(textSelection.text())
    ) {
      textLength = this.sharedDataService.computedTextLengthCache.get(
        textSelection.text()
      );
    } else {
      textLength = textSelection.node().getComputedTextLength();
    }
    this.sharedDataService.computedTextLengthCache.set(
      textSelection.text(),
      textLength
    );
    return textLength;
  }

  private buildData(): [Map<string, SubvariantVisualization>, Set<number>] {
    const intervalWidth = VARIANT_Constants.INTERVAL_LENGTH;
    const gapLength = (20 + VARIANT_Constants.POINT_RADIUS) / intervalWidth;

    let xValues = new Set<number>();
    const starts = new Map<string, [number, number]>();
    const data = new Map<string, SubvariantVisualization>();
    let activeYIndices = new Set<number>();

    let [yIndicesFromMainVariant, _] = this.computeYIndicesFromVariantElement(
      this.mainVariant,
      new Map<string, number[]>(),
      0
    );

    let xIndex = 0;
    this._variant.subvariant.forEach((group) => {
      let starting = group.filter(
        (subvariantNode) => subvariantNode.lifecycle === 'start'
      );
      let completing = group.filter(
        (subvariantNode) => subvariantNode.lifecycle === 'complete'
      );
      starting.forEach((subvariantNode) => {
        let yIndicesForActivity = yIndicesFromMainVariant.get(
          subvariantNode.activity
        );
        let yIndex = yIndicesForActivity.shift();
        yIndicesFromMainVariant.set(
          subvariantNode.activity,
          yIndicesForActivity
        );

        // The tracking of active y-indices is necessary to ensure that we do not draw multiple overlapping subvariant nodes at the same y index.
        // This is only necessary if there are two parallel activity instances with the same label (activity name).
        // E.g. in the following subvariant, we have to ensure that the 'b' node and the second 'a' node are not drawn both at y-index 0, because they would overlap.
        //   x--a--x  x--b--x
        //  x-----a-----x
        while (activeYIndices.has(yIndex)) {
          yIndex++;
        }

        activeYIndices.add(yIndex);

        starts[subvariantNode.activity + subvariantNode.activity_instance] = [
          xIndex,
          yIndex,
        ];
      });

      completing.forEach((subvariantNode) => {
        let startIndices =
          starts[subvariantNode.activity + subvariantNode.activity_instance];

        let m = new SubvariantVisualization();
        m.activity = subvariantNode.activity;
        m.performanceStats = subvariantNode.performance_stats;
        m.xStart = startIndices[0];
        m.xEnd = xIndex;
        m.yIndex = startIndices[1];
        m.isWaitingTimeNode = false;

        xValues.add(m.xStart);
        xValues.add(m.xEnd);

        data.set(subvariantNode.activity + subvariantNode.activity_instance, m);
        activeYIndices.delete(m.yIndex);

        starts.delete(
          (subvariantNode.activity, subvariantNode.activity_instance)
        );
      });

      const nRunning = Array.from(starts.values()).length;
      if (nRunning <= 0) {
        xIndex += gapLength;
      } else {
        xIndex += 1;
      }
    });

    return [data, xValues];
  }

  private buildWaitingTimeData(
    nodesData: Map<string, SubvariantVisualization>
  ): SubvariantVisualization[] {
    let result = [];

    this._variant.waiting_time_events.forEach((waitingTimeEvent) => {
      let xStart = 0;
      let xEnd = 0;
      let yIndex = 0;

      let startActivityData = nodesData.get(
        waitingTimeEvent.start.activity +
          waitingTimeEvent.start.activity_instance
      );
      let completeActivityData = nodesData.get(
        waitingTimeEvent.complete.activity +
          waitingTimeEvent.complete.activity_instance
      );

      if (waitingTimeEvent.start.lifecycle == 'start') {
        xStart = startActivityData.xStart;
      } else {
        xStart = startActivityData.xEnd + 0.2;
      }
      if (waitingTimeEvent.complete.lifecycle == 'start') {
        xEnd = completeActivityData.xStart - 0.2;
      } else {
        xEnd = completeActivityData.xEnd;
      }

      if (waitingTimeEvent.anchor == 'start') {
        yIndex = startActivityData.yIndex;
      } else {
        yIndex = completeActivityData.yIndex;
      }

      let m = new SubvariantVisualization();
      m.activity = 'WAITING TIME NODE';
      m.performanceStats = waitingTimeEvent.performance_stats;
      m.xStart = xStart;
      m.xEnd = xEnd;
      m.yIndex = yIndex;
      m.isWaitingTimeNode = true;

      result.push(m);
    });

    // find duplicates in x-positions between Waiting Time Nodes and Subvariant Nodes; then, introduce gaps
    const yData = this.getSubvariantVisualizationsXPositionMapPerYIndex(
      Array.from(nodesData.values())
    );

    for (let [i, wtEvent] of result.entries()) {
      if (yData.get(wtEvent.yIndex).indexOf(wtEvent.xStart) > -1) {
        result[i].xStart += 0.2;
      }

      if (yData.get(wtEvent.yIndex).indexOf(wtEvent.xEnd) > -1) {
        result[i].xEnd -= 0.2;
      }
    }

    // handle remaining overlapping waiting time events
    for (let r1 of result) {
      for (let [j, r2] of result.entries()) {
        if (r1 === r2) {
          continue;
        }

        if (r1.y != r2.y) {
          continue;
        }

        if (r1.xEnd === r2.xStart) {
          result[j].xStart += 0.2;
        }
      }
    }

    return result;
  }

  private getSubvariantVisualizationsXPositionMapPerYIndex(
    data: SubvariantVisualization[]
  ): Map<number, number[]> {
    const yData = new Map<number, number[]>();
    data.forEach((subvariant: SubvariantVisualization) => {
      if (!yData.has(subvariant.yIndex)) {
        yData.set(subvariant.yIndex, []);
      }

      let yDataForIndex = yData.get(subvariant.yIndex);
      yDataForIndex.push(subvariant.xStart);
      yDataForIndex.push(subvariant.xEnd);
      yData.set(subvariant.yIndex, yDataForIndex);
    });

    return yData;
  }

  private computeYIndicesFromVariantElement(
    variantElement: VariantElement,
    results: Map<string, number[]>,
    currentYIndex: number
  ): [Map<string, number[]>, number] {
    if (variantElement instanceof LeafNode) {
      for (let i = 0; i < variantElement.activity.length; i++) {
        let activity = variantElement.activity[i];
        if (results.has(activity)) {
          let currentValues = results.get(activity);
          currentValues.push(currentYIndex);
          results.set(activity, currentValues);
        } else {
          results.set(activity, [currentYIndex]);
        }
      }

      return [results, currentYIndex];
    }

    if (variantElement instanceof SequenceGroup) {
      let maxIndices: number[] = [];
      let maxIndex = 0;
      for (let child of variantElement.elements) {
        [results, maxIndex] = this.computeYIndicesFromVariantElement(
          child,
          results,
          currentYIndex
        );
        maxIndices.push(maxIndex);
      }

      return [results, Math.max(...maxIndices)];
    }

    if (variantElement instanceof ParallelGroup) {
      let maxYIndex = currentYIndex;
      for (let child of variantElement.elements) {
        [results, maxYIndex] = this.computeYIndicesFromVariantElement(
          child,
          results,
          maxYIndex
        );
        maxYIndex++;
      }

      return [results, maxYIndex - 1];
    }
    return [results, 0];
  }

  public setExpanded(expanded: boolean): void {
    this.expanded = expanded;
    this.draw();
  }

  public toggleExpanded() {
    this.expanded = !this.expanded;
    this.draw();
  }

  changeSelection(sel: SubvariantVisualization) {
    d3.selectAll('.subvariant-rect').classed(
      'selected-subvariant',
      (d) => sel === d
    );
  }
}
