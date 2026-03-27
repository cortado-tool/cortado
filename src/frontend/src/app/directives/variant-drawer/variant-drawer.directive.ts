import { VARIANT_Constants } from './../../constants/variant_element_drawer_constants';

import {
  AfterViewInit,
  asNativeElements,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
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
  AnythingNode,
  ChoiceGroup,
  EndNode,
  FallthroughGroup,
  InvisibleSequenceGroup,
  LeafNode,
  LoopGroup,
  OptionalGroup,
  ParallelGroup,
  RepeatGroup,
  SequenceGroup,
  SkipGroup,
  StartNode,
  VariantElement,
  WaitingTimeNode,
  WildcardNode,
} from 'src/app/objects/Variants/variant_element';
import { textColorForBackgroundColor } from 'src/app/utils/render-utils';
import { ViewMode } from 'src/app/objects/ViewMode';
import { VariantViewModeService } from 'src/app/services/viewModeServices/variant-view-mode.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IVariant } from 'src/app/objects/Variants/variant_interface';
import { ConformanceCheckingService } from 'src/app/services/conformanceChecking/conformance-checking.service';
import { VariantService } from '../../services/variantService/variant.service';
import { ContextMenuService } from '@perfectmemory/ngx-contextmenu';
import { Variant } from 'src/app/objects/Variants/variant';
import { VariantQueryModelerContextMenuComponent } from 'src/app/components/variant-query-modeler/variant-query-modeler-context-menu/variant-query-modeler-context-menu.component';
import { range } from 'lodash';
import { start } from 'repl';

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
    elRef: ElementRef<HTMLElement>,
    private polygonService: PolygonGeneratorService,
    private sharedDataService: SharedDataService, //edited
    private variantViewModeService: VariantViewModeService,
    private conformanceCheckingService: ConformanceCheckingService,
    private variantService: VariantService,
    private contextMenuService: ContextMenuService<any>
  ) {
    this.svgHtmlElement = elRef;
  }

  svgHtmlElement: ElementRef;

  @Input()
  variant: IVariant;

  @Input()
  contextMenuComponent: VariantQueryModelerContextMenuComponent;

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

  @Input()
  addCursorPointer: boolean = true;

  @Output()
  selection = new EventEmitter<Selection<any, any, any, any>>();

  @Output() redrawArcsIfComputed = new EventEmitter();

  @Output()
  operatorAction = new EventEmitter<any>();

  svgSelection!: Selection<any, any, any, any>;

  private _destroy$ = new Subject();

  ngAfterViewInit(): void {
    this.svgSelection = d3.select(this.svgHtmlElement.nativeElement);

    this.svgSelection = this.svgSelection
      .append('g')
      .style('padding-top', '5px');

    this.redraw();

    this.variantViewModeService.viewMode$
      .pipe(takeUntil(this._destroy$))
      .subscribe((viewMode: ViewMode) => {
        this.redraw();
        this.setInspectVariant();
      });

    this.redrawArcsIfComputed.emit();
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
        width_offset = PREFIX_OFFSET + POSTFIX_OFFSET;
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

    if (element instanceof ParallelGroup) {
      this.drawParallelGroup(element.asParallelGroup(), svgElement);
    } else if (element instanceof ChoiceGroup) {
      this.drawChoiceGroup(element.asChoiceGroup(), svgElement);
    } else if (element instanceof FallthroughGroup) {
      this.drawFallthroughGroup(element.asFallthroughGroup(), svgElement);
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
    } else if (element instanceof SkipGroup) {
      this.drawSkipGroup(element.asSkipGroup(), svgElement);
    } else if (element instanceof OptionalGroup) {
      this.drawOptionalGroup(element.asOptionalGroup(), svgElement);
    } else if (element instanceof RepeatGroup) {
      this.drawRepeatGroup(element.asRepeatGroup(), svgElement);
    } else if (element instanceof StartNode) {
      this.drawStartNode(element.asStartNode(), svgElement);
    } else if (element instanceof EndNode) {
      this.drawEndNode(element.asEndNode(), svgElement);
    } else if (element instanceof AnythingNode) {
      this.drawAnythingNode(element.asAnythingNode(), svgElement);
    } else if (element instanceof WildcardNode) {
      this.drawWildcardNode(element.asWildcardNode(), svgElement);
    }
  }

  private ensurePattern(
    svg: d3.Selection<SVGSVGElement, any, any, any>,
    type: string
  ) {
    const defs = svg.select('defs').empty()
      ? svg.append('defs')
      : svg.select('defs');

    const tile = 80;
    const marks = [
      { x: 15, y: 30, s: 19, o: 0.4 },
      { x: 45, y: 55, s: 14, o: 0.4 },
      { x: 65, y: 30, s: 12, o: 0.4 },
      { x: 25, y: 75, s: 14, o: 0.4 },
    ];

    if (type === 'repeat') {
      if (!defs.select('#repeat-loops').empty()) return;

      const pat = defs
        .append('pattern')
        .attr('id', 'repeat-loops')
        .attr('patternUnits', 'userSpaceOnUse') // <- keeps tile size constant
        .attr('width', tile)
        .attr('height', tile);

      pat
        .append('rect')
        .attr('width', tile)
        .attr('height', tile)
        .attr('fill', 'lightgray')
        .attr('opacity', 1);

      pat
        .selectAll('text.rl')
        .data(marks)
        .enter()
        .append('text')
        .attr('class', 'rl')
        .attr('x', (d) => d.x)
        .attr('y', (d) => d.y)
        .attr('fill', '#383838')
        .attr('font-size', (d) => d.s)
        .attr('opacity', (d) => d.o)
        .text('⟳');
    } else if (type === 'optional') {
      if (!defs.select('#optional-qmarks').empty()) return;

      const pat = defs
        .append('pattern')
        .attr('id', 'optional-qmarks')
        .attr('patternUnits', 'userSpaceOnUse') // <- keeps tile size constant
        .attr('width', tile)
        .attr('height', tile);

      pat
        .append('rect')
        .attr('width', tile)
        .attr('height', tile)
        .attr('fill', 'lightgray')
        .attr('opacity', 1);

      pat
        .selectAll('text.qm')
        .data(marks)
        .enter()
        .append('text')
        .attr('class', 'qm')
        .attr('x', (d) => d.x)
        .attr('y', (d) => d.y)
        .attr('fill', '#383838')
        .attr('font-size', (d) => d.s)
        .attr('opacity', (d) => d.o)
        .text('?');
    } else if (type === 'fallthrough') {
      if (!defs.select('#fallthrough-arrows').empty()) return;
      const tile = 80;
      const marks = [
        { x: 5, y: 15, s: 19, o: 0.4 },
        { x: 15, y: 35, s: 17, o: 0.4 },
        { x: 35, y: 55, s: 14, o: 0.4 },
        { x: 65, y: 30, s: 12, o: 0.4 },
        { x: 55, y: 55, s: 12, o: 0.4 },
        { x: 25, y: 75, s: 14, o: 0.4 },
      ];
      const pat = defs
        .append('pattern')
        .attr('id', 'fallthrough-arrows')
        .attr('patternUnits', 'userSpaceOnUse') // <- keeps tile size constant
        .attr('width', tile)
        .attr('height', tile);

      pat
        .append('rect')
        .attr('width', tile)
        .attr('height', tile)
        .attr('fill', 'lightgray')
        .attr('opacity', 1);

      pat
        .selectAll('text.fa')
        .data(marks)
        .enter()
        .append('text')
        .attr('class', 'fa')
        .attr('x', (d) => d.x)
        .attr('y', (d) => d.y)
        .attr('fill', '#383838')
        .attr('font-size', (d) => d.s)
        .attr('opacity', (d) => d.o)
        .text('⇆');
    } else if (type === 'wildcard') {
      if (!defs.select('#wildcard-pattern').empty()) return;
      const tile = 20;

      const pat = defs
        .append('pattern')
        .attr('id', 'wildcard-pattern')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', tile)
        .attr('height', tile);

      pat
        .append('rect')
        .attr('width', tile)
        .attr('height', tile)
        .attr('fill', 'lightgray')
        .attr('opacity', 1);

      pat
        .selectAll('text.star')
        .data([
          { x: 0, y: 0 },
          { x: 12, y: 4 },
          { x: 3, y: 14 },
          { x: 14, y: 14 },
          { x: 7, y: 6 },
        ])
        .enter()
        .append('text')
        .attr('x', (d) => d.x)
        .attr('y', (d) => d.y)
        .attr('fill', '#383838')
        .attr('font-size', 6)
        .attr('opacity', 0.25)
        .text('★');
    } else if (type === 'anything') {
      if (!defs.select('#anything-subprocess').empty()) return;
      const tile = 120;
      const pat = defs
        .append('pattern')
        .attr('id', 'anything-subprocess')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', tile)
        .attr('height', tile);

      pat
        .append('rect')
        .attr('width', tile)
        .attr('height', tile)
        .attr('fill', 'lightgray')
        .attr('opacity', 1);

      pat
        .append('image')
        .attr('href', 'assets/png/any_node_background.png')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', tile)
        .attr('opacity', 0.25);
    }
  }

  public drawOptionalGroup(
    element: OptionalGroup,
    parent: Selection<any, any, any, any>
  ): void {
    const width = element.getWidth();
    const height = element.getHeight();

    let operator_font_size = VARIANT_Constants.FONT_SIZE_OPERATOR;
    let operator_font_color = '#383838ff';

    const polygonPoints = this.polygonService.getPolygonPoints(width, height);

    const operatorColor = 'transparent';
    let laElement = getLowestSelectionActionableElement(element);
    let actionable =
      laElement.parent !== null &&
      laElement.infixSelectableState !== SelectableState.None;

    let polygon = this.createPolygon(
      parent,
      polygonPoints,
      operatorColor,
      actionable,
      true
    );
    const svg = d3.select(this.svgHtmlElement.nativeElement) as any;
    this.ensurePattern(svg, 'optional');
    polygon.style('fill', 'url(#optional-qmarks)');

    if (
      this.traceInfixSelectionMode &&
      element.parent &&
      !(element instanceof InvisibleSequenceGroup)
    ) {
      this.addInfixSelectionAttributes(element, polygon, false);
    }

    if (
      element instanceof InvisibleSequenceGroup ||
      element.parent instanceof SkipGroup
    ) {
      polygon.style('fill', 'transparent');
    } else {
      if (this.onClickCbFc) {
        parent.on('click', (e: PointerEvent) => {
          this.onVariantClick(element);
          e.stopPropagation();
        });
      }
    }

    let xOffset = 0;

    const inEditor =
      d3
        .select(this.svgHtmlElement.nativeElement)
        .classed('in-variant-modeler') ||
      d3.select(this.svgHtmlElement.nativeElement).classed('pattern-variant');

    xOffset +=
      element.getHeadLength() +
      element.getMarginX() -
      element.elements[0].getHeadLength();

    xOffset += VARIANT_Constants.MARGIN_X;

    // Add small operator icons at the top-right of the wrapper
    const iconsGroup = parent.append('g');

    const optionalGroup = iconsGroup.append('g');

    let yOffset = VARIANT_Constants.MARGIN_Y + operator_font_size / 2;

    // background rect (rounded)
    const optionalText = optionalGroup
      .append('text')
      .attr('display', 'block')
      .attr('x', width / 2)
      .attr('y', yOffset)
      .classed('user-select-none', true)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', operator_font_size)
      .attr('fill', operator_font_color)
      .attr('font-weight', 'bold')
      .classed('activity-text', true)
      .text('Optional');

    optionalGroup.style('display', 'inline');

    for (const child of element.elements) {
      if (
        child instanceof WaitingTimeNode &&
        (this.keepStandardView ||
          this.variantViewModeService.viewMode !== ViewMode.PERFORMANCE)
      ) {
        continue;
      }

      const childWidth = child.getWidth(
        !this.keepStandardView &&
          this.variantViewModeService.viewMode === ViewMode.PERFORMANCE
      );
      const childHeight = child.getHeight();
      const yOffset = height / 2 - childHeight / 2;
      const g = parent
        .append('g')
        .attr('transform', `translate(${xOffset}, ${yOffset})`);

      this.draw(child, g, false);
      xOffset += childWidth;
    }

    if (this.onClickCbFc) {
      parent.on('click', (e: PointerEvent) => {
        this.onVariantClick(element);
        e.stopPropagation();
      });
    }

    if (this.onRightMouseClickCbFc || this.contextMenuComponent) {
      parent.on('contextmenu', (e: PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.onRightMouseClickCbFc) {
          this.onRightMouseClickCbFc(this, element, this.variant, e);
        }
        if (this.contextMenuComponent?.contextMenu) {
          this.contextMenuService.show(this.contextMenuComponent.contextMenu, {
            value: element,
            x: (e as any).x || (e as any).clientX,
            y: (e as any).y || (e as any).clientY,
          });
        }
      });
    }

    if (this.onMouseOverCbFc) {
      this.onMouseOverCbFc(this, element, this.variant, parent);
    }
  }

  public drawRepeatGroup(
    element: RepeatGroup,
    parent: Selection<any, any, any, any>
  ): void {
    const width = element.getWidth();
    const height = element.getHeight();

    const repeatCountMin = element.getRepeatCountMin();
    const repeatCountMax = element.getRepeatCountMax();

    let operator_font_size = VARIANT_Constants.FONT_SIZE_OPERATOR;
    let operator_font_color = '#383838ff';

    const polygonPoints = this.polygonService.getPolygonPoints(width, height);

    const operatorColor = 'transparent';
    let laElement = getLowestSelectionActionableElement(element);
    let actionable =
      laElement.parent !== null &&
      laElement.infixSelectableState !== SelectableState.None;

    let polygon = this.createPolygon(
      parent,
      polygonPoints,
      operatorColor,
      actionable,
      true
    );
    const svg = d3.select(this.svgHtmlElement.nativeElement) as any;
    this.ensurePattern(svg, 'repeat');
    polygon.style('fill', 'url(#repeat-loops)');

    if (
      this.traceInfixSelectionMode &&
      element.parent &&
      !(element instanceof InvisibleSequenceGroup)
    ) {
      this.addInfixSelectionAttributes(element, polygon, false);
    }

    if (
      element instanceof InvisibleSequenceGroup ||
      element.parent instanceof SkipGroup
    ) {
      polygon.style('fill', 'transparent');
    } else {
      if (this.onClickCbFc) {
        parent.on('click', (e: PointerEvent) => {
          this.onVariantClick(element);
          e.stopPropagation();
        });
      }
    }

    let xOffset = 0;

    xOffset +=
      element.getHeadLength() +
      element.getMarginX() -
      element.elements[0].getHeadLength();

    xOffset += VARIANT_Constants.MARGIN_X;

    // Add small operator icons at the top-right of the wrapper
    const iconsGroup = parent.append('g');

    let yOffset = VARIANT_Constants.MARGIN_Y + operator_font_size / 2;

    const repeatGroup = iconsGroup.append('g');

    const repeatTextMin = repeatGroup
      .append('text')
      .attr('display', 'block')
      .attr('x', width / 2)
      .attr('y', yOffset)
      .classed('user-select-none', true)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', operator_font_size)
      .attr('font-weight', 'bold')
      .attr('fill', operator_font_color)
      .classed('activity-text', true)
      .text(`⟳ ${repeatCountMin} -`);

    // Limit display of max repeats to 200
    let repeatCountMaxText = '∞';
    if (repeatCountMax < 200) {
      repeatCountMaxText = `${repeatCountMax}`;
    }

    const repeatTextMax = repeatGroup
      .append('text')
      .attr('display', 'block')
      .attr('x', width / 2 + 2)
      .attr('y', yOffset)
      .classed('user-select-none', true)
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', operator_font_size)
      .attr('font-weight', 'bold')
      .attr('fill', operator_font_color)
      .classed('activity-text', true)
      .text(repeatCountMaxText);

    (repeatTextMin as any).on('click', (event: PointerEvent) => {
      event.stopPropagation();
      this.onMinRepeatClick(
        repeatTextMin.node() as SVGGraphicsElement,
        element
      );
    });

    (repeatTextMax as any).on('click', (event: PointerEvent) => {
      event.stopPropagation();
      this.onMaxRepeatClick(
        repeatTextMax.node() as SVGGraphicsElement,
        element
      );
    });

    repeatGroup.style('display', 'inline');

    for (const child of element.elements) {
      if (
        child instanceof WaitingTimeNode &&
        (this.keepStandardView ||
          this.variantViewModeService.viewMode !== ViewMode.PERFORMANCE)
      ) {
        continue;
      }

      const childWidth = child.getWidth(
        !this.keepStandardView &&
          this.variantViewModeService.viewMode === ViewMode.PERFORMANCE
      );
      const childHeight = child.getHeight();
      const yOffset = height / 2 - childHeight / 2;
      const g = parent
        .append('g')
        .attr('transform', `translate(${xOffset}, ${yOffset})`);

      this.draw(child, g, false);
      xOffset += childWidth;
    }

    if (this.onClickCbFc) {
      parent.on('click', (e: PointerEvent) => {
        this.onVariantClick(element);
        e.stopPropagation();
      });
    }

    if (this.onRightMouseClickCbFc || this.contextMenuComponent) {
      parent.on('contextmenu', (e: PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.onRightMouseClickCbFc) {
          this.onRightMouseClickCbFc(this, element, this.variant, e);
        }
        if (this.contextMenuComponent?.contextMenu) {
          this.contextMenuService.show(this.contextMenuComponent.contextMenu, {
            value: element,
            x: (e as any).x || (e as any).clientX,
            y: (e as any).y || (e as any).clientY,
          });
        }
      });
    }

    if (this.onMouseOverCbFc) {
      this.onMouseOverCbFc(this, element, this.variant, parent);
    }
  }

  private onMinRepeatClick(
    circleNode: SVGGraphicsElement,
    element: RepeatGroup
  ) {
    if (!circleNode) return;
    const rect = circleNode.getBoundingClientRect();
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '1';
    input.value = String(element.getRepeatCountMin());
    input.style.position = 'absolute';
    input.style.left = `${rect.left - rect.width * 0.4}px`;
    input.style.top = `${rect.top - rect.height * 0.15}px`;
    input.style.width = `80px`;
    input.style.height = `50px`;
    input.style.fontSize = `30px`;
    input.style.zIndex = '10000';
    input.style.padding = '2px 6px';
    input.style.borderRadius = '4px';
    input.style.border = '1px solid #ffffffa6';
    input.style.backgroundColor = '#5a5a5a93';
    (document.body || document.documentElement).appendChild(input);
    input.focus();
    input.select();

    const cleanup = () => {
      input.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onWindowMouse);
      if (input.parentElement) input.parentElement.removeChild(input);
    };

    const submit = () => {
      const v = parseInt(input.value, 10);
      if (!isNaN(v) && v >= 1) {
        element.setRepeatCountMin(v);
        this.redraw();
      }
      cleanup();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        submit();
      } else if (e.key === 'Escape') {
        cleanup();
      }
    };

    // click outside -> submit and close
    const onWindowMouse = (e: MouseEvent) => {
      if (e.target !== input) {
        submit();
      }
    };

    input.addEventListener('keydown', onKey);
    // add outside click listener asynchronously to avoid immediate trigger
    window.addEventListener('click', onWindowMouse);
  }

  private onMaxRepeatClick(
    circleNode: SVGGraphicsElement,
    element: RepeatGroup
  ) {
    if (!circleNode) return;
    const rect = circleNode.getBoundingClientRect();
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '1';
    input.value = String(element.getRepeatCountMax());
    input.style.position = 'absolute';
    input.style.left = `${rect.left - rect.width * 0.4}px`;
    input.style.top = `${rect.top - rect.height * 0.15}px`;
    input.style.width = `80px`;
    input.style.height = `50px`;
    input.style.fontSize = `30px`;
    input.style.zIndex = '10000';
    input.style.padding = '2px 6px';
    input.style.borderRadius = '4px';
    input.style.border = '1px solid #ffffffa6';
    input.style.backgroundColor = '#5a5a5a93';
    (document.body || document.documentElement).appendChild(input);
    input.focus();
    input.select();

    const cleanup = () => {
      input.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onWindowMouse);
      if (input.parentElement) input.parentElement.removeChild(input);
    };

    const submit = () => {
      const v = parseInt(input.value, 10);
      if (!isNaN(v) && v >= 1) {
        element.setRepeatCountMax(v);
        this.redraw();
      }
      cleanup();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        submit();
      } else if (e.key === 'Escape') {
        cleanup();
      }
    };

    // click outside -> submit and close
    const onWindowMouse = (e: MouseEvent) => {
      if (e.target !== input) {
        submit();
      }
    };

    input.addEventListener('keydown', onKey);
    // add outside click listener asynchronously to avoid immediate trigger
    window.addEventListener('click', onWindowMouse);
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
        this.onVariantClick(loopGroup);
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
        `translate(${width / 2 - 8}, ${VARIANT_Constants.MARGIN_Y})`
      );

    let label = leafNode.activity[0];
    const tspan = activityText
      .append('tspan')
      .attr('x', width / 2)
      .attr('y', y + VARIANT_Constants.FONT_SIZE - VARIANT_Constants.MARGIN_Y)
      .classed(
        'cursor-pointer',
        (!this.traceInfixSelectionMode || actionable) && this.addCursorPointer
      )
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

  drawAnythingNode(
    element: AnythingNode,
    parent: Selection<any, any, any, any>
  ) {
    const width = element.getWidth();
    let height = element.getHeight();
    const polygonPoints = this.polygonService.getPolygonPoints(width, height);

    const color = 'lightgray';

    let laElement = getLowestSelectionActionableElement(element);

    let actionable =
      laElement.parent !== null &&
      laElement.infixSelectableState !== SelectableState.None;

    let polygon = this.createPolygon(
      parent,
      polygonPoints,
      color,
      actionable,
      false
    );

    // Apply subprocess pattern
    const svg = d3.select(this.svgHtmlElement.nativeElement) as any;
    this.ensurePattern(svg, 'anything');
    polygon.style('fill', 'url(#anything-subprocess)');

    if (this.traceInfixSelectionMode) {
      this.addInfixSelectionAttributes(element, polygon, true);
    }

    const textcolor = '#383838ff';

    const activityText = parent
      .append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .classed('user-select-none', true)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', VARIANT_Constants.FONT_SIZE)
      .attr('font-weight', 'bold')
      .attr('fill', textcolor)
      .classed('activity-text', true);

    let y = height / 2;

    let truncated = false;
    let dy = 0;

    element.activity.forEach((a, _i) => {
      const tspan = activityText
        .append('tspan')
        .attr('x', width / 2)
        .attr('y', y + dy)
        .classed(
          'cursor-pointer',
          (!this.traceInfixSelectionMode || actionable) && this.addCursorPointer
        )
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
      // manually trigger tooltip through jquery
      activityText.on('mouseenter', (e: PointerEvent, data) => {
        // @ts-ignore
        this.variantService.activityTooltipReference = $(e.target);
        this.variantService.activityTooltipReference.tooltip('show');
      });
    }

    if (this.onClickCbFc) {
      parent.on('click', (e: PointerEvent) => {
        this.onVariantClick(element);
        // hide the tooltip
        if (this.variantService.activityTooltipReference) {
          this.variantService.activityTooltipReference.tooltip('hide');
        }
        e.stopPropagation();
      });
    }

    if (this.onMouseOverCbFc) {
      this.onMouseOverCbFc(this, element, this.variant, parent);
    }
  }

  drawWildcardNode(
    element: WildcardNode,
    parent: Selection<any, any, any, any>
  ) {
    const width = element.getWidth();
    let height = element.getHeight();
    const polygonPoints = this.polygonService.getPolygonPoints(width, height);

    const color = '#5a5a5ab8';

    let laElement = getLowestSelectionActionableElement(element);

    let actionable =
      laElement.parent !== null &&
      laElement.infixSelectableState !== SelectableState.None;

    let polygon = this.createPolygon(
      parent,
      polygonPoints,
      color,
      actionable,
      false
    );

    const svg = d3.select(this.svgHtmlElement.nativeElement) as any;
    this.ensurePattern(svg, 'wildcard'); // Add new pattern type
    polygon.style('fill', 'url(#wildcard-pattern)'); // Apply pattern

    if (this.traceInfixSelectionMode) {
      this.addInfixSelectionAttributes(element, polygon, true);
    }

    const textcolor = '#383838ff';

    const activityText = parent
      .append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .classed('user-select-none', true)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', VARIANT_Constants.FONT_SIZE)
      .attr('font-weight', 'bold')
      .attr('fill', textcolor)
      .classed('activity-text', true);

    let y = height / 2;
    if (element.activity.length > 1 && element.expanded) {
      y =
        height / 2 -
        ((element.activity.length - 1) / 2) *
          (VARIANT_Constants.FONT_SIZE + VARIANT_Constants.MARGIN_Y);
    }

    let truncated = false;
    let dy = 0;

    // When collapsed, only show first activity
    const activitiesToShow = element.expanded
      ? element.activity
      : [element.activity[0]];

    activitiesToShow.forEach((a, _i) => {
      const tspan = activityText
        .append('tspan')
        .attr('x', width / 2)
        .attr('y', y + dy)
        .classed(
          'cursor-pointer',
          (!this.traceInfixSelectionMode || actionable) && this.addCursorPointer
        )
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
      // manually trigger tooltip through jquery
      activityText.on('mouseenter', (e: PointerEvent, data) => {
        // @ts-ignore
        this.variantService.activityTooltipReference = $(e.target);
        this.variantService.activityTooltipReference.tooltip('show');
      });
    }

    if (this.onClickCbFc) {
      parent.on('click', (e: PointerEvent) => {
        this.onVariantClick(element);
        // hide the tooltip
        if (this.variantService.activityTooltipReference) {
          this.variantService.activityTooltipReference.tooltip('hide');
        }
        e.stopPropagation();
      });
    }

    if (this.onMouseOverCbFc) {
      this.onMouseOverCbFc(this, element, this.variant, parent);
    }
  }

  drawSequenceGroup(
    element: SequenceGroup,
    parent: Selection<any, any, any, any>,
    outerElement: boolean
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

    if (
      element instanceof InvisibleSequenceGroup ||
      element.parent instanceof SkipGroup
    ) {
      polygon.style('fill', 'transparent');
    } else {
      if (this.onClickCbFc) {
        parent.on('click', (e: PointerEvent) => {
          this.onVariantClick(element);
          e.stopPropagation();
        });
      }
    }

    let xOffset = 0;

    const inEditor =
      d3
        .select(this.svgHtmlElement.nativeElement)
        .classed('in-variant-modeler') ||
      d3.select(this.svgHtmlElement.nativeElement).classed('pattern-variant');

    if (
      (!outerElement ||
        inEditor ||
        (!this.keepStandardView &&
          this.variantViewModeService.viewMode === ViewMode.PERFORMANCE)) &&
      !(element.parent instanceof SkipGroup)
    ) {
      xOffset +=
        element.getHeadLength() +
        element.getMarginX() -
        element.elements[0].getHeadLength();
    }

    for (const child of element.elements) {
      if (
        child instanceof WaitingTimeNode &&
        (this.keepStandardView ||
          this.variantViewModeService.viewMode !== ViewMode.PERFORMANCE)
      ) {
        continue;
      }

      const childWidth = child.getWidth(
        !this.keepStandardView &&
          this.variantViewModeService.viewMode === ViewMode.PERFORMANCE
      );
      const childHeight = child.getHeight();
      const yOffset = height / 2 - childHeight / 2;
      const g = parent
        .append('g')
        .attr('transform', `translate(${xOffset}, ${yOffset})`);

      this.draw(child, g, false);
      xOffset += childWidth;
    }

    if (this.onMouseOverCbFc) {
      this.onMouseOverCbFc(this, element, this.variant, parent);
    }

    if (this.onRightMouseClickCbFc || this.contextMenuComponent) {
      parent.on('contextmenu', (e: PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.onRightMouseClickCbFc) {
          this.onRightMouseClickCbFc(this, element, this.variant, e);
        }
        if (this.contextMenuComponent?.contextMenu) {
          this.contextMenuService.show(this.contextMenuComponent.contextMenu, {
            value: element,
            x: (e as any).x || (e as any).clientX,
            y: (e as any).y || (e as any).clientY,
          });
        }
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
        this.onVariantClick(element);
        e.stopPropagation();
      });
    }

    if (this.onRightMouseClickCbFc || this.contextMenuComponent) {
      parent.on('contextmenu', (e: PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.onRightMouseClickCbFc) {
          this.onRightMouseClickCbFc(this, element, this.variant, e);
        }
        if (this.contextMenuComponent?.contextMenu) {
          this.contextMenuService.show(this.contextMenuComponent.contextMenu, {
            value: element,
            x: (e as any).x || (e as any).clientX,
            y: (e as any).y || (e as any).clientY,
          });
        }
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

  drawChoiceGroupCollapsed(
    element: ChoiceGroup,
    parent: Selection<any, any, any, any>
  ): void {
    const width = element.getWidth();
    const height = element.getHeight();

    const polygonPoints = this.polygonService.getPolygonPoints(width, height);

    let laElement = getLowestSelectionActionableElement(element);
    let actionable =
      laElement.parent !== null &&
      laElement.infixSelectableState !== SelectableState.None;

    const color = 'transparent';
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

    if (this.onRightMouseClickCbFc || this.contextMenuComponent) {
      parent.on('contextmenu', (e: PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.onRightMouseClickCbFc) {
          this.onRightMouseClickCbFc(this, element, this.variant, e);
        }
        if (this.contextMenuComponent?.contextMenu) {
          this.contextMenuService.show(this.contextMenuComponent.contextMenu, {
            value: element,
            x: (e as any).x || (e as any).clientX,
            y: (e as any).y || (e as any).clientY,
          });
        }
      });
    }

    //edited
    const textcolor = textColorForBackgroundColor(
      color,
      this.traceInfixSelectionMode && !element.selected
    );

    const v_height = element.getHeight();
    const v_width = element.getWidth();

    const activityText = parent
      .append('text')
      .attr('x', v_width / 2)
      .attr('y', v_height / 2)
      .classed('user-select-none', true)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr(
        'font-size',
        (VARIANT_Constants.LEAF_HEIGHT + VARIANT_Constants.MARGIN_Y) * 1 +
          VARIANT_Constants.MARGIN_Y
      )
      .attr('font-weight', 300)
      .attr('fill', textcolor)
      .classed('activity-text', true);

    const marginX = VARIANT_Constants.MARGIN_X;
    const marginY = VARIANT_Constants.MARGIN_Y;
    const numberOfElements = element.elements.length;
    const elementsToShow = Math.min(3, numberOfElements);
    let y = VARIANT_Constants.MARGIN_Y - (elementsToShow / 2) * marginY;
    if (elementsToShow == 1) {
      y = VARIANT_Constants.MARGIN_Y;
    }
    let x = 2 * VARIANT_Constants.MARGIN_X;
    let startIdx = numberOfElements - elementsToShow;
    for (const idx of range(startIdx, numberOfElements, 1)) {
      const child = element.elements[idx];
      const g = parent.append('g').attr('transform', `translate(${x}, ${y})`);
      this.draw(child, g, false);
      y += marginY;
      x += marginX;
    }

    const collapseButton = parent.append('g').style('cursor', 'pointer');

    // background rect (rounded)
    let circleX = width - 15;
    let circleY = 10;
    let radius = 20 / 2;
    const circle = collapseButton
      .append('circle')
      .attr('cx', circleX)
      .attr('cy', circleY)
      .attr('r', radius)
      .attr('fill', '#66666680')
      .attr('stroke', '#ffffff8e');

    collapseButton
      .append('text')
      .attr('x', circleX)
      .attr('y', circleY + 1)
      .attr('text-anchor', 'middle') // horizontal center
      .attr('dominant-baseline', 'middle') // vertical center
      .attr('font-size', radius * 2)
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .style('pointer-events', 'none') // let clicks pass to the circle/group
      .text('+');

    // attach click listener directly to the polygon selection
    (circle as any).on('click', (event: PointerEvent) => {
      event.stopPropagation();
      element.toggleCollapsed();
      this.redraw();
    });

    if (this.onMouseOverCbFc) {
      this.onMouseOverCbFc(this, element, this.variant, parent);
    }
  }

  drawChoiceGroup(
    element: ChoiceGroup,
    parent: Selection<any, any, any, any>
  ): void {
    if (element.getCollapsed()) {
      this.drawChoiceGroupCollapsed(element, parent);
      return;
    }
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

    if (this.onRightMouseClickCbFc || this.contextMenuComponent) {
      parent.on('contextmenu', (e: PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.onRightMouseClickCbFc) {
          this.onRightMouseClickCbFc(this, element, this.variant, e);
        }
        if (this.contextMenuComponent?.contextMenu) {
          this.contextMenuService.show(this.contextMenuComponent.contextMenu, {
            value: element,
            x: (e as any).x || (e as any).clientX,
            y: (e as any).y || (e as any).clientY,
          });
        }
      });
    }

    let y = VARIANT_Constants.MARGIN_Y;

    const textcolor = textColorForBackgroundColor(
      color,
      this.traceInfixSelectionMode && !element.selected
    );

    const v_height = element.getHeight();
    const v_width = element.getWidth();

    const activityText = parent
      .append('text')
      .attr('x', v_width / 2)
      .attr('y', v_height / 2)
      .classed('user-select-none', true)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr(
        'font-size',
        (VARIANT_Constants.LEAF_HEIGHT + VARIANT_Constants.MARGIN_Y) *
          element.elements.length +
          VARIANT_Constants.MARGIN_Y
      )
      .attr('font-weight', 300)
      .attr('fill', textcolor)
      .classed('activity-text', true);

    const tspan_infront = activityText
      .append('tspan')
      .attr(
        'x',
        element.getHeadLength() +
          0.5 *
            (((VARIANT_Constants.LEAF_HEIGHT + VARIANT_Constants.MARGIN_Y) *
              element.elements.length +
              VARIANT_Constants.MARGIN_Y) /
              2.8) +
          0.5 * VARIANT_Constants.MARGIN_X
      )
      .attr('y', v_height / 2)
      .classed(
        'cursor-pointer',
        (!this.traceInfixSelectionMode || actionable) && this.addCursorPointer
      )
      .attr('fill', '#e0e0e0b0')
      .text('{');

    for (const [idx, child] of element.elements.entries()) {
      if (
        child instanceof WaitingTimeNode &&
        (this.keepStandardView ||
          this.variantViewModeService.viewMode !== ViewMode.PERFORMANCE)
      ) {
        continue;
      }

      const height = child.getHeight();
      const x =
        element.getHeadLength() +
        0.5 * VARIANT_Constants.MARGIN_X +
        ((VARIANT_Constants.LEAF_HEIGHT + VARIANT_Constants.MARGIN_Y) *
          element.elements.length +
          VARIANT_Constants.MARGIN_Y) /
          2.8;
      const g = parent.append('g').attr('transform', `translate(${x}, ${y})`);
      const lineSplitter = parent
        .append('line')
        .attr('x1', x - 0.3 * VARIANT_Constants.MARGIN_X)
        .attr('y1', y - 0.5 * VARIANT_Constants.MARGIN_Y)
        .attr('x2', x + child.getWidth(true))
        .attr('y2', y - 0.5 * VARIANT_Constants.MARGIN_Y)
        .attr('stroke', '#d8d8d8ff')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4 2');

      if (idx === 0) {
        lineSplitter.style('display', 'none');
      }
      this.draw(child, g, false);
      y += height + VARIANT_Constants.MARGIN_Y;
    }

    const tspan_behind = activityText
      .append('tspan')
      .attr(
        'x',
        element.getWidth() -
          element.getHeadLength() -
          0.5 * VARIANT_Constants.MARGIN_X -
          0.5 *
            (((VARIANT_Constants.LEAF_HEIGHT + VARIANT_Constants.MARGIN_Y) *
              element.elements.length +
              VARIANT_Constants.MARGIN_Y) /
              2.8)
      )
      .attr('y', v_height / 2)
      .classed(
        'cursor-pointer',
        (!this.traceInfixSelectionMode || actionable) && this.addCursorPointer
      )
      .attr('fill', '#e0e0e0b0')
      .text('}');

    // Button to collapse/expand choice group
    const collapseButton = parent.append('g').style('cursor', 'pointer');

    // background rect (rounded)
    let circleX = width - 15;
    let circleY = 10;
    let radius = 20 / 2;
    const circle = collapseButton
      .append('circle')
      .attr('cx', circleX)
      .attr('cy', circleY)
      .attr('r', radius)
      .attr('fill', '#66666680')
      .attr('stroke', '#ffffff8e');

    collapseButton
      .append('text')
      .attr('x', circleX)
      .attr('y', circleY + 1)
      .attr('text-anchor', 'middle') // horizontal center
      .attr('dominant-baseline', 'middle') // vertical center
      .attr('font-size', radius * 2)
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .style('pointer-events', 'none') // let clicks pass to the circle/group
      .text('-');

    // attach click listener directly to the polygon selection
    (circle as any).on('click', (event: PointerEvent) => {
      event.stopPropagation();
      if (element.getElements().length < 2) return; // do not collapse if only one element
      element.toggleCollapsed();
      this.redraw();
    });

    if (this.onMouseOverCbFc) {
      this.onMouseOverCbFc(this, element, this.variant, parent);
    }
  }

  drawFallthroughGroup(
    element: FallthroughGroup,
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
    let polygon = this.createFallthroughPolygon(
      parent,
      polygonPoints,
      color,
      actionable,
      true
    );

    const svg = d3.select(this.svgHtmlElement.nativeElement) as any;
    this.ensurePattern(svg, 'fallthrough');
    polygon.style('fill', 'url(#fallthrough-arrows)');

    if (
      this.traceInfixSelectionMode &&
      !(element instanceof InvisibleSequenceGroup)
    ) {
      this.addInfixSelectionAttributes(element, polygon, false);
    }

    if (this.onClickCbFc) {
      parent.on('click', (e: PointerEvent) => {
        this.onVariantClick(element);
        e.stopPropagation();
      });
    }

    if (this.onRightMouseClickCbFc || this.contextMenuComponent) {
      parent.on('contextmenu', (e: PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.onRightMouseClickCbFc) {
          this.onRightMouseClickCbFc(this, element, this.variant, e);
        }
        if (this.contextMenuComponent?.contextMenu) {
          this.contextMenuService.show(this.contextMenuComponent.contextMenu, {
            value: element,
            x: (e as any).x || (e as any).clientX,
            y: (e as any).y || (e as any).clientY,
          });
        }
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
      .classed(
        'cursor-pointer',
        (!this.traceInfixSelectionMode || actionable) && this.addCursorPointer
      );

    if (group) {
      poly.classed('chevron-group', true);
      poly.style('fill-opacity', 0.5).style('stroke-width', 2);
    }

    return poly;
  }

  private createFallthroughPolygon(
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
    poly.classed('chevron-group', true);
    poly.style('stroke-width', 2);
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

    let laElement = getLowestSelectionActionableElement(element);

    let actionable =
      laElement.parent !== null &&
      laElement.infixSelectableState !== SelectableState.None;

    let polygon = this.createPolygon(
      parent,
      polygonPoints,
      color,
      actionable,
      false
    );

    if (this.traceInfixSelectionMode) {
      this.addInfixSelectionAttributes(element, polygon, true);
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
        .classed(
          'cursor-pointer',
          (!this.traceInfixSelectionMode || actionable) && this.addCursorPointer
        )
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
      // manually trigger tooltip through jquery
      activityText.on('mouseenter', (e: PointerEvent, data) => {
        // @ts-ignore
        this.variantService.activityTooltipReference = $(e.target);
        this.variantService.activityTooltipReference.tooltip('show');
      });
    }

    if (this.onClickCbFc) {
      parent.on('click', (e: PointerEvent) => {
        this.onVariantClick(element);
        // hide the tooltip
        if (this.variantService.activityTooltipReference) {
          this.variantService.activityTooltipReference.tooltip('hide');
        }
        e.stopPropagation();
      });
    }

    if (this.onMouseOverCbFc) {
      this.onMouseOverCbFc(this, element, this.variant, parent);
    }
  }

  public drawStartNode(
    element: StartNode,
    parent: Selection<any, any, any, any>
  ): void {
    const width = element.getWidth(false);
    let height = element.getHeight();
    const polygonPoints = this.polygonService.getPolygonPoints(width, height);

    const color = 'transparent';

    let laElement = getLowestSelectionActionableElement(element);

    let actionable =
      laElement.parent !== null &&
      laElement.infixSelectableState !== SelectableState.None;

    let polygon = this.createPolygon(
      parent,
      polygonPoints,
      color,
      actionable,
      false
    );

    if (this.traceInfixSelectionMode) {
      this.addInfixSelectionAttributes(element, polygon, true);
    }

    const textcolor = 'white';

    const activityText = parent
      .append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .classed('user-select-none', true)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', VARIANT_Constants.FONT_SIZE)
      .attr('font-weight', 'bold')
      .attr('fill', textcolor)
      .classed('activity-text', true);

    let y = height / 2;

    let dy = 0;

    const tspan = activityText
      .append('tspan')
      .attr('x', width / 2)
      .attr('y', y + dy)
      .text('START');

    if (this.onClickCbFc) {
      parent.on('click', (e: PointerEvent) => {
        this.onVariantClick(element);
        // hide the tooltip
        if (this.variantService.activityTooltipReference) {
          this.variantService.activityTooltipReference.tooltip('hide');
        }
        e.stopPropagation();
      });
    }

    if (this.onMouseOverCbFc) {
      this.onMouseOverCbFc(this, element, this.variant, parent);
    }
  }

  public drawEndNode(
    element: EndNode,
    parent: Selection<any, any, any, any>
  ): void {
    const width = element.getWidth(false);
    let height = element.getHeight();
    const polygonPoints = this.polygonService.getPolygonPoints(width, height);

    const color = 'transparent';

    let laElement = getLowestSelectionActionableElement(element);

    let actionable =
      laElement.parent !== null &&
      laElement.infixSelectableState !== SelectableState.None;

    let polygon = this.createPolygon(
      parent,
      polygonPoints,
      color,
      actionable,
      false
    );

    if (this.traceInfixSelectionMode) {
      this.addInfixSelectionAttributes(element, polygon, true);
    }

    const textcolor = 'white';

    const activityText = parent
      .append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .classed('user-select-none', true)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', VARIANT_Constants.FONT_SIZE)
      .attr('font-weight', 'bold')
      .attr('fill', textcolor)
      .classed('activity-text', true);

    let y = height / 2;

    let dy = 0;

    const tspan = activityText
      .append('tspan')
      .attr('x', width / 2)
      .attr('y', y + dy)
      .text('END');

    if (this.onClickCbFc) {
      parent.on('click', (e: PointerEvent) => {
        this.onVariantClick(element);
        // hide the tooltip
        if (this.variantService.activityTooltipReference) {
          this.variantService.activityTooltipReference.tooltip('hide');
        }
        e.stopPropagation();
      });
    }

    if (this.onMouseOverCbFc) {
      this.onMouseOverCbFc(this, element, this.variant, parent);
    }
  }

  onVariantClick(element: VariantElement) {
    this.onClickCbFc(this, element, this.variant);
    this.redrawArcsIfComputed.emit();
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
        this.onVariantClick(element);
        e.stopPropagation();
      });
    }

    if (this.onRightMouseClickCbFc || this.contextMenuComponent) {
      parent.on('contextmenu', (e: PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.onRightMouseClickCbFc) {
          this.onRightMouseClickCbFc(this, element, this.variant, e);
        }
        if (this.contextMenuComponent?.contextMenu) {
          this.contextMenuService.show(this.contextMenuComponent.contextMenu, {
            value: element,
            x: (e as any).x || (e as any).clientX,
            y: (e as any).y || (e as any).clientY,
          });
        }
      });
    }

    if (this.onMouseOverCbFc) {
      this.onMouseOverCbFc(this, element, this.variant, parent);
    }
  }

  drawSkipGroup(
    element: SequenceGroup,
    parent: Selection<any, any, any, any>
  ): void {
    const height = element.getHeight();

    let xOffset = 0;

    element.elements.forEach((child, idx) => {
      const childWidth = child.getWidth(
        !this.keepStandardView &&
          this.variantViewModeService.viewMode === ViewMode.PERFORMANCE
      );
      const childHeight = child.getHeight();
      const yOffset = height / 2 - childHeight / 2;
      const g = parent
        .append('g')
        .attr('transform', `translate(${xOffset}, ${yOffset})`);

      this.draw(child, g, false);
      xOffset += childWidth;

      if (idx >= element.elements.length - 1) return;

      const heightOffset =
        (element.getHeight() - 2 * VARIANT_Constants.MARGIN_Y) / 2 - 7.65;
      xOffset += VARIANT_Constants.SKIP_MARGIN;
      parent
        .append('g')
        .attr('transform', `translate(${xOffset}, ${heightOffset})`)
        .append('use')
        .attr('href', '#infixDots')
        .attr('transform', 'scale(1.7)');
      xOffset += VARIANT_Constants.SKIP_WIDTH + VARIANT_Constants.SKIP_MARGIN;
    });

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
      if (text[text.length - 1] == ' ') {
        text = text.slice(0, -1);
      }
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
      const node = textSelection.node();
      // Use SVG's native getComputedTextLength() for accurate measurement
      if (typeof node.getComputedTextLength === 'function') {
        textLength = node.getComputedTextLength();
      } else {
        textLength = node.getBoundingClientRect().width;
      }
      if (textLength == 0) {
        textLength =
          textSelection.text().length * VARIANT_Constants.CHAR_LENGTH;
      }
    }
    if (textLength > 0) {
      this.sharedDataService.computedTextLengthCache.set(
        textSelection.text(),
        textLength
      );
    }

    return textLength;
  }

  /*
  public resetCachedTextLength() {
    this.sharedDataService.computedTextLengthCache = new Map<string, number>();
    console.log('reset');
  }*/

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
        this.variantViewModeService.viewMode === ViewMode.PERFORMANCE &&
        this.addCursorPointer
    );
    d3.selectAll('.activity-text').classed(
      'cursor-pointer',
      !this.keepStandardView &&
        this.variantViewModeService.viewMode === ViewMode.PERFORMANCE &&
        this.addCursorPointer
    );
  }

  changeSelected(group: VariantElement) {
    d3.selectAll('.variant-element-group')
      .selectAll('polygon')
      .classed('selected-polygon', (d) => group === d);
  }
}
