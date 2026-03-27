import {
  Component,
  EventEmitter,
  Output,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
  HostBinding,
  OnDestroy,
} from '@angular/core';
import {
  ChoiceGroup,
  LoopGroup,
  OptionalGroup,
  ParallelGroup,
  SequenceGroup,
  VariantElement,
  WildcardNode,
} from 'src/app/objects/Variants/variant_element';
import { ZoomFieldComponent } from '../zoom-field/zoom-field.component';
import { ColorMapService } from '../../services/colorMapService/color-map.service';
import { VariantDrawerDirective } from 'src/app/directives/variant-drawer/variant-drawer.directive';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Choice } from '../variant-miner/variant-miner.component';

export type TreeNodeType = 'plus' | 'and' | 'or' | 'query';

export interface LogicTreeNode {
  id: string;
  type: TreeNodeType;
  children?: LogicTreeNode[];
  x?: number;
  y?: number;
  queryId?: number; // For query nodes, tracks which query modeler instance
  variantElement?: VariantElement; // For variant nodes, stores the VariantElement
}

@Component({
  selector: 'app-query-logic-tree',
  templateUrl: './query-logic-tree.component.html',
  styleUrls: ['./query-logic-tree.component.css'],
})
export class QueryLogicTreeComponent implements OnInit, OnDestroy {
  @HostBinding('style.display') display = 'contents';

  @Input() rootNode: LogicTreeNode;
  @Input() currentEditingQueryId: number | null = null;
  @Input() queryNodes: Map<number, LogicTreeNode> = new Map();
  @Input() showPreviews: boolean = true;

  @Output() nodeUpdated = new EventEmitter<LogicTreeNode>();
  @Output() queryCreated = new EventEmitter<{
    node: LogicTreeNode;
    queryId: number;
  }>();
  @Output() querySelected = new EventEmitter<{
    node: LogicTreeNode;
    queryId: number;
  }>();

  @ViewChild('treeSvg', { static: false }) treeSvg: ElementRef<SVGSVGElement>;
  @ViewChild(ZoomFieldComponent, { static: false })
  zoomField: ZoomFieldComponent;

  showMenu = false;
  menuX = 0;
  menuY = 0;
  selectedNodeId: string | null = null;

  public colorMap: Map<string, string> = new Map();
  private destroy$ = new Subject<void>();

  private nodeIdCounter = 0;
  private horizontalSpacing = 200;
  private verticalSpacing = 80;
  private initialX = 0;
  private initialY = 0;

  constructor(private colorMapService: ColorMapService) {}

  ngOnInit() {
    if (!this.rootNode) {
      this.rootNode = this.createPlusNode();
    }
    this.calculateLayout(this.rootNode, this.initialX, this.initialY);

    // Subscribe to color map updates
    this.colorMapService.colorMap$
      .pipe(takeUntil(this.destroy$))
      .subscribe((colorMap) => {
        this.colorMap = colorMap;
      });

    setTimeout(() => {
      this.centerTree(0);
    }, 100);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createPlusNode(): LogicTreeNode {
    return {
      id: `node-${this.nodeIdCounter++}`,
      type: 'plus',
    };
  }

  onNodeClick(node: LogicTreeNode, event: MouseEvent) {
    event.stopPropagation();
    if (node.type === 'plus') {
      this.selectedNodeId = node.id;
      this.menuX = (event as any).clientX;
      this.menuY = (event as any).clientY;
      this.showMenu = true;
    } else if (node.type === 'query' && node.queryId) {
      // Emit event to select this variant for editing
      this.querySelected.emit({ node, queryId: node.queryId });
    }
  }

  selectOperator(operator: 'and' | 'or' | 'query') {
    if (this.selectedNodeId) {
      const node = this.findNodeById(this.rootNode, this.selectedNodeId);
      if (node) {
        node.type = operator;
        if (operator === 'query') {
          // Variant is a leaf node - no children
          node.children = undefined;
          node.queryId = this.nodeIdCounter;
          this.nodeIdCounter++;

          this.queryCreated.emit({ node, queryId: node.queryId });

          // Automatically select the newly created variant for editing
          this.querySelected.emit({ node, queryId: node.queryId });
        } else {
          // AND/OR operators get two plus children
          node.children = [this.createPlusNode(), this.createPlusNode()];
        }
        this.calculateLayout(this.rootNode, this.initialX, this.initialY);
        this.nodeUpdated.emit(this.rootNode);
      }
    }
    this.showMenu = false;
    this.selectedNodeId = null;
  }

  private findNodeById(
    node: LogicTreeNode | undefined,
    id: string
  ): LogicTreeNode | null {
    if (!node) return null;
    if (node.id === id) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = this.findNodeById(child, id);
        if (found) return found;
      }
    }
    return null;
  }

  // Calculate layout positions for the tree nodes
  private calculateLayout(node: LogicTreeNode, x: number, y: number) {
    if (!node) return;

    node.x = x;
    node.y = y;

    if (node.children && node.children.length > 0) {
      // Calculate total height needed for all children
      const childHeights = node.children.map((child) =>
        this.calculateSubtreeHeight(child)
      );
      const totalHeight = childHeights.reduce((sum, h) => sum + h, 0);

      let currentY = y - totalHeight / 2;

      node.children.forEach((child, index) => {
        const childX = x + this.horizontalSpacing;
        const childHeight = childHeights[index];
        const childY = currentY + childHeight / 2;

        this.calculateLayout(child, childX, childY);
        currentY += childHeight;
      });
    }
  }

  private calculateSubtreeHeight(node: LogicTreeNode): number {
    if (!node) return this.verticalSpacing;

    if (!node.children || node.children.length === 0) {
      return this.verticalSpacing;
    }

    const childrenHeights = node.children.map((child) =>
      this.calculateSubtreeHeight(child)
    );
    return childrenHeights.reduce((sum, h) => sum + h, 0);
  }

  getNodeLabel(type: TreeNodeType): string {
    switch (type) {
      case 'plus':
        return '+';
      case 'and':
        return '∧';
      case 'or':
        return '∨';
      case 'query':
        return 'Q'; // Icon rendered via template
      default:
        return '?';
    }
  }

  closeMenu() {
    this.showMenu = false;
    this.selectedNodeId = null;
  }

  public centerTree(animationDuration: number = 0) {
    if (this.zoomField) {
      this.zoomField.centerContent(animationDuration);
    }
  }

  public recenterAfterUpdate() {
    this.calculateLayout(this.rootNode, this.initialX, this.initialY);
    this.centerTree(0);
  }

  getCollapsedVariantCopy(node: LogicTreeNode): VariantElement | null {
    if (!node.variantElement) return null;

    // Set choice groups to collapsed state

    // Create a copy of the variant element
    const copy = node.variantElement.copy();
    copy.setExpanded(false);

    this.traverseVariantElements([copy]);

    return copy;
  }

  traverseVariantElements(elements: VariantElement[]) {
    elements.forEach((el) => {
      if (el instanceof ChoiceGroup) {
        el.asChoiceGroup().setCollapsed(true);
      }
      if (
        el instanceof ParallelGroup ||
        el instanceof SequenceGroup ||
        el instanceof LoopGroup ||
        el instanceof OptionalGroup
      ) {
        this.traverseVariantElements(el.getElements());
      }
    });
  }

  getPreviewTransform(node: LogicTreeNode): string {
    if (!node.variantElement) return '';

    const scale = 0.5;

    // Get the dimensions of the variant element
    const width = node.variantElement.getWidth?.(false) || 0;
    const height = node.variantElement.getHeight?.() || 0;
    const x = node.x + 40;
    const y = node.y - (height * scale) / 2;

    return `translate(${x}, ${y}) scale(${scale})`;
  }

  computeActivityColor = (
    self: VariantDrawerDirective,
    element: VariantElement
  ) => {
    let color;
    color = this.colorMap.get(element.asLeafNode().activity[0]);

    if (!color) {
      color = '#d3d3d3'; // lightgrey
    }

    return color;
  };
}
