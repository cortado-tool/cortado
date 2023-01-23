import { VARIANT_Constants } from './../constants/variant_element_drawer_constants';
import { ElementRef, Injectable } from '@angular/core';
import { Selection } from 'd3';
import { PolygonGeneratorService } from './polygon-generator.service';
import * as d3 from 'd3';
import { LeafNode } from '../objects/Variants/variant_element';
import { textColorForBackgroundColor } from '../utils/render-utils';

@Injectable({
  providedIn: 'root',
})
export class PolygonDrawingService {
  private textLengthCache = new Map<string, number>();

  private variantExplorerDiv: HTMLElement;
  private tooltipContainer: Selection<any, any, any, any>;
  private tooltipInner: Selection<any, any, any, any>;

  constructor(private polygonService: PolygonGeneratorService) {}

  public setElementRefereneces(
    variantExplorerRef: ElementRef<HTMLDivElement>,
    tooltipContainerRef: ElementRef<HTMLDivElement>
  ) {
    this.variantExplorerDiv = variantExplorerRef.nativeElement;
    this.tooltipContainer = d3.select(tooltipContainerRef.nativeElement);
    this.tooltipInner = d3.select(
      tooltipContainerRef.nativeElement.firstChild as HTMLElement
    );
  }

  public drawLegend(
    elements: LeafNode[],
    parent: Selection<any, any, any, any>,
    colorMap: Map<string, string>,
    textUnderLegend: string = 'Variants'
  ): void {
    let offsetY = VARIANT_Constants.LEGEND_MARGIN_Y + 20;
    let offsetX = VARIANT_Constants.LEGEND_MARGIN_X;
    let parent_width = 0;

    let width = Math.max(...elements.map((e) => e.getWidth(false, true)));
    let height = elements[0].getHeight();

    parent
      .append('line')
      .attr('x1', VARIANT_Constants.LEGEND_MARGIN_X)
      .attr('x2', (VARIANT_Constants.MAX_OFFSETWIDTH + width).toString())
      .attr('y1', '20')
      .attr('y2', '20')
      .attr('stroke', 'black')
      .attr('stroke-width', '1.5');

    parent
      .append('text')
      .attr('x', VARIANT_Constants.LEGEND_MARGIN_X)
      .attr('y', '15')
      .attr('fill', 'black')
      .attr('font-size', '15')
      .insert('tspan')
      .attr('height', '10')
      .text('Activities');

    for (let element of elements) {
      const polygonPoints = this.polygonService.getPolygonPoints(width, height);

      let color = colorMap.get(element.activity[0]);

      const polygon = parent
        .append('polygon')
        .attr('points', polygonPoints)
        .style('fill', color)
        .style('stWroke', 'none')
        .attr('transform', `translate(${offsetX}, ${offsetY})`);

      const activityText = parent
        .append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('transform', `translate(${offsetX}, ${offsetY})`)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', VARIANT_Constants.FONT_SIZE)
        .attr('fill', textColorForBackgroundColor(color));

      activityText
        .append('tspan')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .text(element.activity[0])
        .attr(
          'height',
          VARIANT_Constants.FONT_SIZE + VARIANT_Constants.MARGIN_Y
        );

      offsetX += width + VARIANT_Constants.LEGEND_MARGIN_X;

      if (offsetX >= VARIANT_Constants.MAX_OFFSETWIDTH) {
        parent_width = Math.max(parent_width, offsetX);
        offsetX = VARIANT_Constants.LEGEND_MARGIN_X;
        offsetY += height + VARIANT_Constants.LEGEND_MARGIN_Y;
      }
    }

    offsetY =
      offsetX === VARIANT_Constants.LEGEND_MARGIN_X
        ? offsetY
        : offsetY + height + VARIANT_Constants.LEGEND_MARGIN_Y;

    parent
      .attr('width', parent_width)
      .attr('height', offsetY + VARIANT_Constants.MARGIN_Y + 40);

    parent
      .append('line')
      .attr('x1', VARIANT_Constants.LEGEND_MARGIN_X)
      .attr('x2', (VARIANT_Constants.MAX_OFFSETWIDTH + width).toString())
      .attr('y1', offsetY)
      .attr('y2', offsetY)
      .attr('stroke', 'black')
      .attr('stroke-width', '1.5');

    parent
      .append('text')
      .attr('x', VARIANT_Constants.LEGEND_MARGIN_X)
      .attr('y', offsetY + 20)
      .attr('fill', 'black')
      .attr('font-size', '15')
      .insert('tspan')
      .attr('height', '10')
      .text(textUnderLegend);
  }
}
