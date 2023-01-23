import { VARIANT_Constants } from './../../constants/variant_element_drawer_constants';

import {
  Directive,
  EventEmitter,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { AfterViewInit, ElementRef } from '@angular/core';
import { Input } from '@angular/core';
import * as d3 from 'd3';
import { Selection } from 'd3';
import { PolygonGeneratorService } from 'src/app/services/polygon-generator.service';
import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
import {
  getLowestSelectionActionableElement,
  InfixType,
  SelectableState,
} from 'src/app/objects/Variants/infix_selection';
import {
  VariantElement,
  SequenceGroup,
  ParallelGroup,
  LeafNode,
  WaitingTimeNode,
  InvisibleSequenceGroup,
  LoopGroup,
} from 'src/app/objects/Variants/variant_element';
import { textColorForBackgroundColor } from 'src/app/utils/render-utils';
import { ViewMode } from 'src/app/objects/ViewMode';
import { VariantViewModeService } from 'src/app/services/viewModeServices/variant-view-mode.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IVariant } from 'src/app/objects/Variants/variant_interface';

@Directive({
  selector: '[appVariantDrawer]',
  exportAs: 'variantDrawer',
})
export class VariantDrawerDirective
  implements AfterViewInit, OnChanges, OnDestroy
{
  setExpanded(expanded: boolean) {
    this.variant.variant.setExpanded(expanded);
    this.variant.alignment?.setExpanded(expanded);
    this.redraw();
  }

  constructor(
    elRef: ElementRef,
    private polygonService: PolygonGeneratorService,
    private sharedDataService: SharedDataService,
    private variantViewModeService: VariantViewModeService
  ) {
    this.svgHtmlElement = elRef;
  }

  svgHtmlElement: ElementRef;

  @Input()
  variant: IVariant;

  @Input()
  traceInfixSelectionMode: boolean = false;

  @Input()
  infixType: InfixType;

  @Input()
  computeActivityColor: (
    drawerDirective: VariantDrawerDirective,
    element: VariantElement,
    variant: IVariant
  ) => string;

  @Input()
  onClickCbFc: (
    drawerDirective: VariantDrawerDirective,
    element: VariantElement,
    variant: IVariant
  ) => void;

  @Input()
  onMouseOverCbFc: (
    drawerDirective: VariantDrawerDirective,
    element: VariantElement,
    variant: IVariant,
    selection
  ) => void;

  @Input()
  onRightMouseClickCbFc: (
    drawerDirective: VariantDrawerDirective,
    element: VariantElement,
    variant: IVariant,
    event: Event
  ) => void;

  @Input()
  keepStandardView: boolean = false;

  @Output()
  selection = new EventEmitter<Selection<any, any, any, any>>();

  svgSelection!: Selection<any, any, any, any>;

  private _destroy$ = new Subject();

  ngAfterViewInit(): void {
    this.svgSelection = d3
      .select(this.svgHtmlElement.nativeElement)
      .append('g')
      .style('padding-top', '5px');

    this.redraw();

    this.variantViewModeService.viewMode$
      .pipe(takeUntil(this._destroy$))
      .subscribe((viewMode: ViewMode) => {
        this.redraw();
        this.setInspectVariant();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.variant &&
      !changes.variant.firstChange &&
      changes.variant.currentValue
    ) {
      this.redraw();
    } else if (
      changes.infixType &&
      !changes.infixType.firstChange &&
      changes.infixType.currentValue
    ) {
      this.redraw();
    } else if (
      changes.traceInfixSelectionMode &&
      (!changes.variant || !changes.variant.firstChange)
    ) {
      this.redraw();
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  redraw(): void {
    this.svgSelection.selectAll('*').remove();

    if (this.variant.variant) {
      const height = this.variant.variant.recalculateHeight(
        !this.keepStandardView &&
          this.variantViewModeService.viewMode === ViewMode.PERFORMANCE
      );
      const width = this.variant.variant.recalculateWidth(
        !this.keepStandardView &&
          this.variantViewModeService.viewMode === ViewMode.PERFORMANCE
      );

      if (
        !this.keepStandardView &&
        this.variantViewModeService.viewMode === ViewMode.CONFORMANCE &&
        this.variant.alignment
      ) {
        const height = this.variant.alignment.recalculateHeight(false);
        const width = this.variant.alignment.recalculateWidth(false);
      }

      const svg_container = d3.select(this.svgHtmlElement.nativeElement);
      this.variant.variant.updateWidth(
        !this.keepStandardView &&
          this.variantViewModeService.viewMode === ViewMode.PERFORMANCE
      );

      const [svg, width_offset] = this.handleInfix(
        this.infixType,
        height,
        width
      );

      svg_container
        .attr('width', width + width_offset)
        .attr('height', height + 2 * VARIANT_Constants.SELECTION_STROKE_WIDTH);

      if (
        !this.keepStandardView &&
        this.variantViewModeService.viewMode === ViewMode.CONFORMANCE &&
        this.variant.alignment
      )
        this.draw(this.variant.alignment, svg, true);
      else this.draw(this.variant.variant, svg, true);

      if (
        this.variant.variant instanceof SequenceGroup &&
        (this.keepStandardView ||
          this.variantViewModeService.viewMode !== ViewMode.PERFORMANCE)
      ) {
        this.svgSelection.select('polygon').style('fill', 'transparent');
      }

      this.selection.emit(this.svgSelection);
    }
  }

  private handleInfix(infixType, height: number, width: number): [any, number] {
    let width_offset = 0;

    const PREFIX_OFFSET = 35;
    const POSTFIX_OFFSET = 25;
    const PROPER_INFIX_OFFSET = 60;

    const svg = this.svgSelection;
    const variant_svg = svg
      .append('g')
      .attr('width', width)
      .attr('height', height);

    const height_offset = (height - 2 * VARIANT_Constants.MARGIN_Y) / 2 - 7.65;
    switch (infixType) {
      case InfixType.NOT_AN_INFIX:
        break;

      case InfixType.POSTFIX:
        width_offset = POSTFIX_OFFSET;
        break;

      case InfixType.PREFIX:
        width_offset = PREFIX_OFFSET;
        break;

      case InfixType.PROPER_INFIX:
        width_offset = PROPER_INFIX_OFFSET;
        break;
    }

    svg.attr('width', width + width_offset).attr('height', height);

    if (
      infixType === InfixType.POSTFIX ||
      infixType === InfixType.PROPER_INFIX
    ) {
      variant_svg.attr(
        'transform',
        `translate(${PREFIX_OFFSET}, ${VARIANT_Constants.SELECTION_STROKE_WIDTH})`
      );

      svg
        .append('g')
        .attr('transform', `translate(0, ${height_offset})`)
        .append('use')
        .attr('href', '#infixDots')
        .attr('transform', 'scale(1.7)');
    } else {
      variant_svg.attr(
        'transform',
        `translate(0, ${VARIANT_Constants.SELECTION_STROKE_WIDTH})`
      );
    }

    if (
      infixType === InfixType.PREFIX ||
      infixType === InfixType.PROPER_INFIX
    ) {
      svg
        .append('g')
        .attr(
          'transform',
          `translate(${
            width + (infixType === InfixType.PROPER_INFIX ? PREFIX_OFFSET : 0)
          }, ${height_offset})`
        )
        .append('use')
        .attr('href', '#infixDots')
        .attr('transform', 'scale(1.7)');
    }

    return [variant_svg, width_offset];
  }

  draw(
    element: VariantElement,
    svgElement: Selection<any, any, any, any>,
    outerElement: boolean = false
  ): void {
    svgElement.datum(element).classed('variant-element-group', true);

    if (outerElement) {
      svgElement.datum(element);
    }

    if (element instanceof ParallelGroup) {
      this.drawParallelGroup(element.asParallelGroup(), svgElement);
    } else if (element instanceof SequenceGroup) {
      this.drawSequenceGroup(
        element.asSequenceGroup(),
        svgElement,
        outerElement
      );
    } else if (element instanceof LeafNode) {
      this.drawLeafNode(element.asLeafNode(), svgElement);
    } else if (element instanceof WaitingTimeNode) {
      this.drawWaitingNode(element.asLeafNode(), svgElement);
    } else if (element instanceof LoopGroup) {
      this.drawLoopGroup(element.asLoopGroup(), svgElement);
    }
  }

  public drawLoopGroup(
    loopGroup: LoopGroup,
    parent: Selection<any, any, any, any>
  ): void {
    const width = loopGroup.getWidth();
    const height = loopGroup.getHeight();

    let leafNode = loopGroup.elements[0].asLeafNode();

    const polygonPoints = this.polygonService.getPolygonPoints(width, height);

    const color = this.computeActivityColor(this, leafNode, this.variant);

    let laElement = getLowestSelectionActionableElement(loopGroup);
    let actionable =
      laElement.parent !== null &&
      laElement.infixSelectableState !== SelectableState.None;

    let polygon = this.createPolygon(parent, polygonPoints, color, actionable);

    if (this.traceInfixSelectionMode) {
      this.addInfixSelectionAttributes(loopGroup, polygon, true);
    }

    if (this.onClickCbFc) {
      parent.on('click', (e: PointerEvent) => {
        this.onClickCbFc(this, loopGroup, this.variant);
        e.stopPropagation();
      });
    }

    const textcolor = textColorForBackgroundColor(
      color,
      this.traceInfixSelectionMode && !loopGroup.selected
    );

    const activityText = parent
      .append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .classed('user-select-none', true)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', VARIANT_Constants.FONT_SIZE)
      .attr('fill', textcolor)
      .classed('activity-text', true);

    let y = height / 2;
    if (leafNode.activity.length > 1) {
      y =
        height / 2 -
        ((leafNode.activity.length - 1) / 2) *
          (VARIANT_Constants.FONT_SIZE + VARIANT_Constants.MARGIN_Y);
    }

    parent
      .append('path')
      .attr('fill', textcolor)
      .attr(
        'd',
        'M11 5.466V4H5a4 4 0 0 0-3.584 5.777.5.5 0 1 1-.896.446A5 5 0 0 1 5 3h6V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192Zm3.81.086a.5.5 0 0 1 .67.225A5 5 0 0 1 11 13H5v1.466a.25.25 0 0 1-.41.192l-2.36-1.966a.25.25 0 0 1 0-.384l2.36-1.966a.25.25 0 0 1 .41.192V12h6a4 4 0 0 0 3.585-5.777.5.5 0 0 1 .225-.67Z'
      )
      .attr(
        'transform',
        'translate(' + (width / 2 - 8) + ',' + VARIANT_Constants.MARGIN_Y + ')'
      );

    let label = leafNode.activity[0];
    const tspan = activityText
      .append('tspan')
      .attr('x', width / 2)
      .attr('y', y + VARIANT_Constants.FONT_SIZE - VARIANT_Constants.MARGIN_Y)
      .classed('cursor-pointer', !this.traceInfixSelectionMode || actionable)
      .text(label);

    const maxWidth =
      loopGroup.getWidth() -
      loopGroup.getHeadLength() * 2 -
      VARIANT_Constants.MARGIN_X;
    const truncated = this.wrapInnerLabelText(tspan, label, maxWidth);

    if (truncated) {
      activityText
        .attr('title', leafNode.activity[0])
        .attr('data-bs-toggle', 'tooltip');
    }

    if (this.onMouseOverCbFc) {
      this.onMouseOverCbFc(this, loopGroup, this.variant, parent);
    }
  }

  drawSequenceGroup(
    element: SequenceGroup,
    parent: Selection<any, any, any, any>,
    outerElement
  ): void {
    const width = element.getWidth();
    const height = element.getHeight();
    const polygonPoints = this.polygonService.getPolygonPoints(width, height);

    const color = 'lightgrey';

    let laElement = getLowestSelectionActionableElement(element);
    let actionable =
      laElement.parent !== null &&
      laElement.infixSelectableState !== SelectableState.None;

    let polygon = this.createPolygon(
      parent,
      polygonPoints,
      color,
      actionable,
      true
    );

    if (
      this.traceInfixSelectionMode &&
      element.parent &&
      !(element instanceof InvisibleSequenceGroup)
    ) {
      this.addInfixSelectionAttributes(element, polygon, false);
    }

    if (element instanceof InvisibleSequenceGroup) {
      polygon.style('fill', 'transparent');
    } else {
      if (this.onClickCbFc) {
        parent.on('click', (e: PointerEvent) => {
          this.onClickCbFc(this, element, this.variant);
          e.stopPropagation();
        });
      }
    }

    let x =
      outerElement &&
      (this.keepStandardView ||
        this.variantViewModeService.viewMode !== ViewMode.PERFORMANCE)
        ? 0
        : element.getHeadLength() +
          element.getMarginX() -
          element.elements[0].getHeadLength();

    for (const child of element.elements) {
      if (
        child instanceof WaitingTimeNode &&
        (this.keepStandardView ||
          this.variantViewModeService.viewMode !== ViewMode.PERFORMANCE)
      ) {
        continue;
      }

      const width = child.getWidth(
        !this.keepStandardView &&
          this.variantViewModeService.viewMode === ViewMode.PERFORMANCE
      );
      const childHeight = child.getHeight();
      const y = height / 2 - childHeight / 2;
      const g = parent.append('g').attr('transform', `translate(${x}, ${y})`);

      this.draw(child, g, false);
      x += width;
    }

    if (this.onMouseOverCbFc) {
      this.onMouseOverCbFc(this, element, this.variant, parent);
    }

    if (this.onRightMouseClickCbFc) {
      parent.on('contextmenu', (e: PointerEvent) => {
        this.onRightMouseClickCbFc(this, element, this.variant, e);
        e.stopPropagation();
      });
    }
  }

  drawParallelGroup(
    element: ParallelGroup,
    parent: Selection<any, any, any, any>
  ): void {
    const width = element.getWidth();
    const height = element.getHeight();

    const polygonPoints = this.polygonService.getPolygonPoints(width, height);

    let laElement = getLowestSelectionActionableElement(element);
    let actionable =
      laElement.parent !== null &&
      laElement.infixSelectableState !== SelectableState.None;

    const color = 'lightgrey';
    let polygon = this.createPolygon(
      parent,
      polygonPoints,
      color,
      actionable,
      true
    );

    if (
      this.traceInfixSelectionMode &&
      !(element instanceof InvisibleSequenceGroup)
    ) {
      this.addInfixSelectionAttributes(element, polygon, false);
    }

    if (this.onClickCbFc) {
      parent.on('click', (e: PointerEvent) => {
        this.onClickCbFc(this, element, this.variant);
        e.stopPropagation();
      });
    }

    if (this.onRightMouseClickCbFc) {
      parent.on('contextmenu', (e: PointerEvent) => {
        this.onRightMouseClickCbFc(this, element, this.variant, e);
        e.stopPropagation();
      });
    }

    let y = VARIANT_Constants.MARGIN_Y;

    for (const child of element.elements) {
      if (
        child instanceof WaitingTimeNode &&
        (this.keepStandardView ||
          this.variantViewModeService.viewMode !== ViewMode.PERFORMANCE)
      ) {
        continue;
      }

      const height = child.getHeight();
      const x = element.getHeadLength() + 0.5 * VARIANT_Constants.MARGIN_X;
      const g = parent.append('g').attr('transform', `translate(${x}, ${y})`);
      this.draw(child, g, false);
      y += height + VARIANT_Constants.MARGIN_Y;
    }

    if (this.onMouseOverCbFc) {
      this.onMouseOverCbFc(this, element, this.variant, parent);
    }
  }

  private createPolygon(
    parent: d3.Selection<any, any, any, any>,
    polygonPoints: string,
    color: string,
    actionable: boolean,
    group = false
  ) {
    const poly = parent
      .append('polygon')
      .attr('points', polygonPoints)
      .style('fill', color)
      .classed('cursor-pointer', !this.traceInfixSelectionMode || actionable);

    if (group) {
      poly.style('fill-opacity', 0.5).style('stroke-width', 2);
    }

    return poly;
  }

  public drawLeafNode(
    element: LeafNode,
    parent: Selection<any, any, any, any>
  ): void {
    const width = element.getWidth();
    let height = element.getHeight();

    const polygonPoints = this.polygonService.getPolygonPoints(width, height);

    const color = this.computeActivityColor(this, element, this.variant);

    const rgb_code = [
      color.substring(1, 3),
      color.substring(3, 5),
      color.substring(5, 7),
    ];
    const inversed = rgb_code.map((d) => 255 - parseInt(d, 16));

    let laElement = getLowestSelectionActionableElement(element);

    let actionable =
      laElement.parent !== null &&
      laElement.infixSelectableState !== SelectableState.None;

    let polygon = this.createPolygon(parent, polygonPoints, color, actionable);

    if (this.traceInfixSelectionMode) {
      this.addInfixSelectionAttributes(element, polygon, true);
    }

    if (this.onClickCbFc) {
      parent.on('click', (e: PointerEvent) => {
        this.onClickCbFc(this, element, this.variant);
        e.stopPropagation();
      });
    }

    const textcolor = textColorForBackgroundColor(
      color,
      this.traceInfixSelectionMode && !element.selected
    );

    const activityText = parent
      .append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .classed('user-select-none', true)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', VARIANT_Constants.FONT_SIZE)
      .attr('fill', textcolor)
      .classed('activity-text', true);

    let y = height / 2;
    if (element.activity.length > 1) {
      y =
        height / 2 -
        ((element.activity.length - 1) / 2) *
          (VARIANT_Constants.FONT_SIZE + VARIANT_Constants.MARGIN_Y);
    }

    let truncated = false;
    let dy = 0;
    element.activity.forEach((a, _i) => {
      const tspan = activityText
        .append('tspan')
        .attr('x', width / 2)
        .attr('y', y + dy)
        .classed('cursor-pointer', !this.traceInfixSelectionMode || actionable)
        .text(a);

      dy += VARIANT_Constants.FONT_SIZE + VARIANT_Constants.MARGIN_Y;
      tspan.attr(
        'height',
        VARIANT_Constants.FONT_SIZE + VARIANT_Constants.MARGIN_Y
      );

      const maxWidth =
        element.getWidth() -
        element.getHeadLength() * 2 -
        VARIANT_Constants.MARGIN_X;

      const tr = this.wrapInnerLabelText(tspan, a, maxWidth);
      truncated ||= tr;

      if (a === 'W_Nabellen incomplete dossiers' && !tr) {
        console.log('Did not wrap', a, tspan, maxWidth);
      }
    });

    if (truncated) {
      activityText
        .attr('title', element.activity.join(';'))
        .attr('data-bs-toggle', 'tooltip');
    }

    if (this.onMouseOverCbFc) {
      this.onMouseOverCbFc(this, element, this.variant, parent);
    }
  }

  private addInfixSelectionAttributes(
    element: VariantElement,
    polygon: any,
    isLeafNode: boolean
  ) {
    if (
      !this.keepStandardView &&
      this.variantViewModeService.viewMode === ViewMode.PERFORMANCE
    )
      return;

    if (element.selected) {
      polygon.attr('stroke-opacity', '0.5');
      if (!element.isVisibleParentSelected())
        polygon.attr('stroke', '#ff0000').attr('stroke-width', '4px');
      return;
    }

    if (element.infixSelectableState !== SelectableState.Selectable) {
      polygon.style('fill-opacity', '0.1');
      return;
    }

    // element is selectable
    polygon
      .attr('stroke', '#ff0000')
      .attr('stroke-width', '1px')
      .attr('stroke-dasharray', 4);

    if (isLeafNode) {
      polygon.style('fill-opacity', '0.2');
    } else {
      polygon.style('fill', '#999999');
    }
  }

  private drawWaitingNode(
    element: LeafNode,
    parent: Selection<any, any, any, any>
  ) {
    const width = element.getWidth();
    const height = element.getHeight();

    const polygonPoints = this.polygonService.getPolygonPoints(width, height);

    const color = this.computeActivityColor(this, element, this.variant);

    this.createPolygon(parent, polygonPoints, color, false);

    if (this.onClickCbFc) {
      parent.on('click', (e: PointerEvent) => {
        this.onClickCbFc(this, element, this.variant);
        e.stopPropagation();
      });
    }

    if (this.onRightMouseClickCbFc) {
      parent.on('contextmenu', (e: PointerEvent) => {
        this.onRightMouseClickCbFc(this, element, this.variant, e);
        e.stopPropagation();
      });
    }

    if (this.onMouseOverCbFc) {
      this.onMouseOverCbFc(this, element, this.variant, parent);
    }
  }

  private wrapInnerLabelText(
    textSelection: Selection<any, any, any, any>,
    text: string,
    maxWidth: number
  ): boolean {
    let textLength = this.getComputedTextLength(textSelection);

    let truncated = false;
    while (textLength > maxWidth && text.length > 1) {
      text = text.slice(0, -1);
      textSelection.text(text + '..');
      textLength = this.getComputedTextLength(textSelection);
      truncated = true;
    }

    if (text === 'W_Nabellen incomplete dossiers' && !truncated) {
      console.log('Inner Text length after Wrap', text, textLength, maxWidth);
    }

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

  getSVGGraphicElement(): SVGGraphicsElement {
    return this.svgHtmlElement.nativeElement;
  }

  isExpanded(): boolean {
    return this.variant.variant.expanded;
  }

  setInspectVariant() {
    d3.select('.selected-polygon').classed('selected-polygon', false);
    d3.selectAll('.variant-polygon').classed(
      'cursor-pointer',
      !this.keepStandardView &&
        this.variantViewModeService.viewMode === ViewMode.PERFORMANCE
    );
    d3.selectAll('.activity-text').classed(
      'cursor-pointer',
      !this.keepStandardView &&
        this.variantViewModeService.viewMode === ViewMode.PERFORMANCE
    );
  }

  changeSelected(group: VariantElement) {
    d3.selectAll('.variant-element-group')
      .selectAll('polygon')
      .classed('selected-polygon', (d) => group === d);
  }
}
