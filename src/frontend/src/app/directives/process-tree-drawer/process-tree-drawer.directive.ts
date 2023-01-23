import { PT_Constant } from './../../constants/process_tree_drawer_constants';
import { ProcessTreeService } from 'src/app/services/processTreeService/process-tree.service';
import { Directive, ElementRef, Input } from '@angular/core';
import {
  ProcessTree,
  ProcessTreeOperator,
} from 'src/app/objects/ProcessTree/ProcessTree';
import { flextree } from 'd3-flextree';

import * as d3 from 'd3';
import { ModelViewModeService } from 'src/app/services/viewModeServices/model-view-mode.service';
import { ViewMode } from 'src/app/objects/ViewMode';

@Directive({
  selector: '[appProcessTreeDrawer]',
})
export class ProcessTreeDrawerDirective {
  nodeEnter: any;

  root: d3.HierarchyNode<any>;
  mainSvgGroup: any;

  processTreeSyntaxInfo: any;
  selectedRootNode: any;

  constructor(
    elRef: ElementRef,
    private processTreeService: ProcessTreeService,
    private modelViewModeService: ModelViewModeService
  ) {
    this.mainSvgGroup = d3.select(elRef.nativeElement);
  }

  @Input()
  computeNodeColor;

  @Input()
  computeTextColor;

  @Input()
  tooltipText;

  @Input()
  onClickCallBack;

  redraw(tree: ProcessTree) {
    if (tree) {
      this.root = d3.hierarchy(tree, (d) => {
        // @ts-ignore
        return d.children;
      });
    } else {
      this.root = null;
    }

    this.update(this.root);
  }

  drawNodes(node: d3.Selection<any, any, any, any>) {
    // add node groups
    this.nodeEnter = node
      .enter()
      .append('g')
      .attr('id', function (d) {
        return d.data.id;
      })
      .attr('data-bs-toggle', 'tooltip')
      .attr('data-bs-placement', 'top')
      .attr('data-bs-title', (d) => this.tooltipText(d))
      .attr('data-bs-template', (d) => {
        if (
          (this.modelViewModeService.viewMode === ViewMode.PERFORMANCE &&
            d.data.hasPerformance() &&
            d.data.label !== ProcessTreeOperator.tau) ||
          (this.modelViewModeService.viewMode === ViewMode.CONFORMANCE &&
            d.data.conformance !== null)
        ) {
          return `<div class="tooltip performance-tooltip" role="tooltip">
                <div class="tooltip-arrow"></div>
                <div class="tooltip-inner p-0" style="max-width: none;"></div>
              </div>`;
        }

        return `<div class="tooltip" role="tooltip">
              <div class="tooltip-arrow"></div>
              <div class="tooltip-inner"></div>
            </div>`;
      })
      .attr('data-bs-html', true);

    // add nodes
    this.nodeEnter
      .append('rect')
      .classed('node', true)
      .attr('rx', PT_Constant.CORNER_RADIUS)
      .attr('ry', PT_Constant.CORNER_RADIUS)
      .attr('stroke', PT_Constant.STROKE_COLOR)
      .attr('stroke-width', PT_Constant.STROKE_WIDTH)
      .merge(node.select('.node'))
      .style('fill', (d) => this.computeNodeColor(d))
      .classed('node-operator', function (d: any) {
        return d.data.operator !== null;
      })
      .classed('frozen-node-operator', function (d: any) {
        return d.data.operator !== null && d.data.frozen === true;
      })
      .classed('node-visible-activity', function (d: any) {
        return (
          d.data.label !== null && d.data.label !== ProcessTreeOperator.tau
        );
      })
      .classed('selected-node', function (d: any) {
        return d.data.selected;
      })
      .classed('frozen-node-visible-activity', function (d: any) {
        return (
          d.data.label !== null &&
          d.data.label !== ProcessTreeOperator.tau &&
          d.data.frozen === true
        );
      })
      .classed('node-invisible-activity', (d: any) => {
        return d.data.label === ProcessTreeOperator.tau;
      })
      .classed('frozen-node-invisible-activity', (d: any) => {
        return (
          d.data.label === ProcessTreeOperator.tau && d.data.frozen === true
        );
      })
      .attr('width', PT_Constant.BASE_HEIGHT_WIDTH)
      .attr('height', PT_Constant.BASE_HEIGHT_WIDTH)
      .attr('font-size', (d: any) => {
        if (d.data.label === ProcessTreeOperator.tau)
          return PT_Constant.INVISIBLE_FONT_SIZE;
        return '';
      })
      .attr('x', function (d: any) {
        return d.x - PT_Constant.BASE_HEIGHT_WIDTH / 2;
      })
      .attr('y', function (d: any) {
        return d.y;
      });

    // add node text
    this.nodeEnter
      .append('text')
      .classed('user-select-none', true)
      .classed('node-text', true)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .merge(node.select('text'))
      .attr('fill', (d) => this.computeTextColor(d))
      .attr('font-size', (d: any) => {
        if (d.data.operator) {
          return PT_Constant.OPERATOR_FONT_SIZE;
        }
        return PT_Constant.VISIBLE_FONT_SIZE;
      })
      .attr('x', function (d: any) {
        return d.x;
      })
      .attr('y', function (d: any) {
        return d.y + PT_Constant.BASE_HEIGHT_WIDTH / 2 + 3;
      })
      .text(function (d: any) {
        if (d.data.operator) {
          return d.data.operator;
        }
        if (d.data.label) {
          // shorten text if it is too long
          if (d.data.label.length <= 20) {
            return d.data.label;
          } else {
            return d.data.label.substring(0, 20) + '...';
          }
        }
      });

    // resize leaf nodes if text is too long
    this.nodeEnter
      .merge(node)
      .select('.node-visible-activity')
      .attr('x', function (d) {
        return (
          d.x -
          Math.max(
            PT_Constant.BASE_HEIGHT_WIDTH,
            this.nextSibling.getComputedTextLength() + 10
          ) /
            2
        );
      })
      .attr('width', function () {
        return Math.max(
          PT_Constant.BASE_HEIGHT_WIDTH,
          this.nextSibling.getComputedTextLength() + 10
        );
      });

    // remove nodes
    node.exit().transition().duration(50).remove();
  }

  drawEdges(root) {
    const edges = this.mainSvgGroup.selectAll('line').data(root.links());

    edges.classed('selected-edge', false);

    // remove old edges
    edges.exit().remove();

    // add edges
    edges
      .enter()
      .append('line')
      .attr('class', 'link')
      .merge(edges)
      // .transition()
      .attr('x1', function (d: any) {
        return d.source.x;
      })
      .attr('y1', function (d: any) {
        return d.source.y + PT_Constant.BASE_HEIGHT_WIDTH;
      })
      .attr('x2', function (d: any) {
        return d.target.x;
      })
      .attr('y2', function (d: any) {
        return d.target.y;
      })
      .attr('stroke', PT_Constant.STROKE_COLOR)
      .classed('frozen-edge', (d) => {
        return d.source.data.frozen;
      })
      .classed('selected-edge', (e) => {
        return e.source.data.selected;
      });
  }

  update(root): void {
    this.mainSvgGroup.selectAll('g').remove();

    if (root) {
      // add node groups that contain a rectangle and text

      this.calculateTreeLayout(root);

      const node = this.mainSvgGroup
        .selectAll('g')
        .data(root.descendants(), function (d) {
          return d.data.id;
        });

      // Draw Nodes
      this.drawNodes(node);

      // Draw Edges
      this.drawEdges(root);

      this.addSelectionFunctionality();
    } else {
      this.selectedRootNode = null;
      this.mainSvgGroup.selectAll('*').remove();
    }
  }

  createNode(operator, label): d3.HierarchyNode<any> {
    // TODO make sure that IDs are unique!!!
    const nodeData = {
      operator,
      label,
      id: Math.floor(1000000000 + Math.random() * 900000000),
      children: [],
    };
    return d3.hierarchy(nodeData);
  }

  calculateTreeLayout(root): void {
    if (root) {
      const flextreeLayout = flextree();
      flextreeLayout.nodeSize((node) => {
        if (node.data.operator || node.data.label === ProcessTreeOperator.tau) {
          return [
            PT_Constant.BASE_HEIGHT_WIDTH,
            2 * PT_Constant.BASE_HEIGHT_WIDTH,
          ];
        }

        return [
          this.processTreeService.nodeWidthCache[node.data.label],
          2 * PT_Constant.BASE_HEIGHT_WIDTH,
        ];
      });

      // Specifies the spacing between two nodes
      flextreeLayout.spacing((nodeA, nodeB) => {
        return nodeA.parent === nodeB.parent
          ? PT_Constant.NODE_SPACING
          : 2 * PT_Constant.NODE_SPACING;
      });

      // calculate layout
      flextreeLayout(root);
    }
  }

  addSelectionFunctionality(): void {
    this.nodeEnter.on('click', (e: PointerEvent, data) => {
      this.onClickCallBack(this, e, data);
      e.stopPropagation();
    });
  }
}
