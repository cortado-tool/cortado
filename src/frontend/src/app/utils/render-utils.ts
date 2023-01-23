export function textColorForBackgroundColor(
  backgroundColorInHex: string,
  unselectedElementInTraceInfixSelectionMode: boolean = false
): string {
  if (
    backgroundColorInHex === undefined ||
    unselectedElementInTraceInfixSelectionMode
  ) {
    return 'white';
  }
  return isDarkColor(backgroundColorInHex) ? 'white' : 'black';

  function isDarkColor(color: string): boolean {
    let res;
    if (color === undefined) {
      return true;
    }
    if (color.includes('rgb')) {
      res = rgbToArray(color);
    } else {
      res = hexToRgb(color);
    }
    if (0.2126 * res['r'] + 0.7152 * res['g'] + 0.0722 * res['b'] >= 135) {
      return false;
    } else {
      return true;
    }
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  function rgbToArray(rgb) {
    let arr = rgb.slice(4, -1).split(',');
    return {
      r: arr[0],
      g: arr[1],
      b: arr[2],
    };
  }
}

import { Selection } from 'd3';
import { PT_Constant } from '../constants/process_tree_drawer_constants';
import { LeafNode } from '../objects/Variants/variant_element';

export function applyInverseStrokeToPoly(poly: Selection<any, any, any, any>) {
  const datum = poly.data()[0];
  if (datum) {
    if (datum instanceof LeafNode) {
      const rgb_code = poly.attr('style').match(/[\d.]+/g);
      const inversed = rgb_code.map((d) => 255 - parseInt(d));

      poly.attr('style', poly.attr('style').split(';')[0]);
      poly.attr('stroke-width', 2);
      poly.attr(
        'stroke',
        `rgb(${inversed[0]}, ${inversed[1]}, ${inversed[2]})`
      );
    } else {
      poly
        .attr('stroke', '#dc3545')
        .attr('style', poly.attr('style').split(';')[0])
        .attr('stroke-width', 2);
    }
  }
}

import * as d3 from 'd3';

export function computeLeafNodeWidth(
  nodeActivityLabels: string[],
  nodeWidthCache: Map<string, number>
): Map<string, number> {
  const dummy_container = d3
    .select('body')
    .append('svg')
    .style('top', '0px')
    .style('left', '0px')
    .style('position', 'absolute');

  const dummy_select = dummy_container.append('text').attr('font-size', '12px');

  for (let nodeActivityLabel of nodeActivityLabels) {
    // Compute the width by rendering a dummy node
    dummy_select.text(function (d: any) {
      if (nodeActivityLabel.length <= 20) {
        return nodeActivityLabel;
      } else {
        return nodeActivityLabel.substring(0, 20) + '...';
      }
    });

    // Retrieve the computed width
    let rendered_width = dummy_select.node().getComputedTextLength();

    // Compute the true node width as specified above
    rendered_width = Math.max(
      rendered_width + 10,
      PT_Constant.BASE_HEIGHT_WIDTH
    );

    // Add to Cache
    nodeWidthCache[nodeActivityLabel] = rendered_width;
  }

  // Delete the Dummy
  dummy_select.remove();
  dummy_container.remove();

  return nodeWidthCache;
}
