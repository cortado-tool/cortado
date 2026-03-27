import { ZoomFieldComponent } from '../zoom-field/zoom-field.component';
import { VariantService } from '../../services/variantService/variant.service';
import { BackendService } from 'src/app/services/backendService/backend.service';
import { VariantExplorerComponent } from '../variant-explorer/variant-explorer.component';
import { GoldenLayoutComponentService } from '../../services/goldenLayoutService/golden-layout-component.service';
import { ColorMapService } from '../../services/colorMapService/color-map.service';
import { ComponentContainer, LogicalZIndex } from 'golden-layout';
import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
import Swal from 'sweetalert2';
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  Renderer2,
  ViewChild,
  HostListener,
  OnDestroy,
} from '@angular/core';

import { cloneDeep } from 'lodash';
import { Selection } from 'd3';
import * as d3 from 'd3';
import { LogService } from 'src/app/services/logService/log.service';
import { LayoutChangeDirective } from 'src/app/directives/layout-change/layout-change.directive';
import { VariantDrawerDirective } from 'src/app/directives/variant-drawer/variant-drawer.directive';
import {
  LeafNode,
  ParallelGroup,
  SequenceGroup,
  VariantElement,
  ChoiceGroup,
  OptionalGroup,
  RepeatGroup,
  FallthroughGroup,
  StartNode,
  EndNode,
  WildcardNode,
  AnythingNode,
} from 'src/app/objects/Variants/variant_element';
import { collapsingText, fadeInText } from 'src/app/animations/text-animations';
import { findPathToSelectedNode } from 'src/app/objects/Variants/utility_functions';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { VariantFilterService } from 'src/app/services/variantFilterService/variant-filter.service';
import {
  LogicTreeNode,
  QueryLogicTreeComponent,
} from '../query-logic-tree/query-logic-tree.component';

@Component({
  selector: 'app-variant-query-modeler',
  templateUrl: './variant-query-modeler.component.html',
  styleUrls: ['./variant-query-modeler.component.css'],
  animations: [fadeInText, collapsingText],
})
export class VariantQueryModelerComponent
  extends LayoutChangeDirective
  implements OnInit, OnDestroy
{
  logicTree: LogicTreeNode = {
    id: 'root',
    type: 'plus',
  };

  // Map to track all variant nodes by their variantIndex
  queryNodes: Map<number, LogicTreeNode> = new Map();

  // Currently selected variant for editing with toolbar
  currentEditingQueryId: number | null = null;

  activityNames: Array<String> = [];

  public colorMap: Map<string, string>;

  VariantQueryModelerComponent = VariantQueryModelerComponent;

  @ViewChild('VariantMainGroup')
  variantElement: ElementRef;

  @ViewChild(ZoomFieldComponent)
  editor: ZoomFieldComponent;

  @ViewChild(VariantDrawerDirective)
  variantDrawer: VariantDrawerDirective;

  @ViewChild(QueryLogicTreeComponent, { static: false })
  queryLogicTreeComponent: QueryLogicTreeComponent;

  currentVariant: VariantElement = null;

  cachedVariants: VariantElement[] = [null]; // edited
  cacheSize: number = 100;
  cacheIdx: number = 0;

  emptyVariant: boolean = true;

  selectedElement = false;
  multiSelect = false;
  multipleSelected = false;

  newLeaf;

  collapse: boolean = false;

  insertionStrategy = activityInsertionStrategy;
  selectedStrategy = this.insertionStrategy.behind;

  variantEnrichedSelection: Selection<any, any, any, any>;
  zoom: any;

  // Query type selection for visual pattern matching
  public queryType: 'BFS' | 'DFS' | 'VM' | 'VM_LAZY' = 'VM';

  // Preview mode for logic tree
  public previewMode: boolean = false;

  private _destroy$ = new Subject();

  constructor(
    private sharedDataService: SharedDataService,
    private logService: LogService,
    private variantService: VariantService,
    private backendService: BackendService,
    private variantFilterService: VariantFilterService,
    private colorMapService: ColorMapService,
    @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken)
    private container: ComponentContainer,
    private goldenLayoutComponentService: GoldenLayoutComponentService,
    elRef: ElementRef,
    renderer: Renderer2
  ) {
    super(elRef.nativeElement, renderer);
  }

  ngOnInit(): void {
    this.logService.activitiesInEventLog$
      .pipe(takeUntil(this._destroy$))
      .subscribe((activities) => {
        this.activityNames = [];
        for (const activity in activities) {
          this.activityNames.push(activity);
          this.activityNames.sort();
        }
      });

    this.logService.loadedEventLog$
      .pipe(takeUntil(this._destroy$))
      .subscribe((newLog) => {
        if (newLog) {
          this.emptyVariant = true;
        }
      });

    this.colorMapService.colorMap$
      .pipe(takeUntil(this._destroy$))
      .subscribe((map) => {
        this.colorMap = map;
        if (this.variantDrawer) {
          this.variantDrawer.redraw();
        }
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  handleResponsiveChange(
    left: number,
    top: number,
    width: number,
    height: number
  ): void {
    this.collapse = width < 1150;
  }

  handleVisibilityChange(visibility: boolean): void {}

  handleZIndexChange(
    logicalZIndex: LogicalZIndex,
    defaultZIndex: string
  ): void {}

  handleRedraw(selection: Selection<any, any, any, any>) {
    selection.selectAll('g').on('click', function (event, _) {
      event.stopPropagation();
      const select = d3.select(this as SVGElement);
      toogleSelect(select);
    });
    const toogleSelect = function (svgSelection) {
      if (!this.multiSelect) {
        d3.select('#VariantMainGroup')
          .selectAll('.selected-polygon')
          .classed('selected-polygon', false)
          .attr('stroke', false);

        d3.select('#VariantMainGroup')
          .selectAll('.chevron-group')
          .style('fill-opacity', 0.5);

        d3.select('#VariantMainGroup')
          .selectAll('.selected-variant-g')
          .classed('selected-variant-g', false);

        svgSelection.classed('selected-variant-g', true);

        const poly = svgSelection.select('polygon');
        poly.classed('selected-polygon', true);

        this.multipleSelected = false;
      } else {
        this.multipleSelected = true;

        svgSelection.classed(
          'selected-variant-g',
          !svgSelection.classed('selected-variant-g')
        );

        const poly = svgSelection.select('polygon');

        poly.classed('selected-polygon', !poly.classed('selected-polygon'));

        // If one is selected reactivate insert
        if (
          d3
            .select('#VariantMainGroup')
            .selectAll('.selected-variant-g')
            .nodes().length == 1
        ) {
          this.multipleSelected = false;
        }
      }
      this.selectedElement = true;
    }.bind(this);

    selection.selectAll('g').classed('selected-variant-g', (d) => {
      return d === this.newLeaf;
    });

    if (!(selection.selectAll('.selected-variant-g').nodes().length > 0)) {
      this.selectedElement = false;
    }

    this.variantEnrichedSelection = selection;
  }

  handleActivityButtonClick(event) {
    if (this.selectedElement || this.emptyVariant) {
      const leaf = new LeafNode([event.activityName]);
      this.newLeaf = leaf;

      // hide tooltip
      if (this.variantService.activityTooltipReference) {
        this.variantService.activityTooltipReference.tooltip('hide');
      }

      if (this.emptyVariant) {
        const variantGroup = new SequenceGroup([leaf]);
        variantGroup.setExpanded(true);
        this.currentVariant = variantGroup;
        this.emptyVariant = false;
        this.selectedElement = true;
      } else {
        leaf.setExpanded(true);
        const selectedElement = this.variantEnrichedSelection
          .selectAll('.selected-variant-g')
          .data()[0];

        // Check if trying to insert into a locked Optional/Repeat group within ParallelGroup
        if (this.isInsideLockedGroup(selectedElement)) {
          this.fireAlert(
            'Insertion Error',
            'Cannot modify Optional or Repeat groups that are children of a Parallel group.',
            'info'
          );
          return;
        }

        switch (this.selectedStrategy) {
          case this.insertionStrategy.infront:
            if (!this.multipleSelected) {
              this.handleInfrontInsert(
                this.currentVariant,
                leaf,
                selectedElement
              );
              const grandParent = this.findParent(
                this.currentVariant,
                this.findParent(this.currentVariant, leaf)
              );
              if (grandParent instanceof ParallelGroup) {
                this.sortParallel(grandParent);
              }
            }
            break;
          case this.insertionStrategy.behind:
            if (!this.multipleSelected) {
              this.handleBehindInsert(
                this.currentVariant,
                leaf,
                selectedElement
              );
              const grandParent = this.findParent(
                this.currentVariant,
                this.findParent(this.currentVariant, leaf)
              );
              if (grandParent instanceof ParallelGroup) {
                this.sortParallel(grandParent);
              }
            }
            break;
          case this.insertionStrategy.parallel:
            let inserted = false;
            if (!this.multipleSelected) {
              inserted = this.handleParallelInsert(
                this.currentVariant,
                leaf,
                selectedElement
              );
            }
            // else {
            //   const selectedElements = this.variantEnrichedSelection
            //     .selectAll('.selected-variant-g')
            //     .data();
            //   this.handleMultiParallelInsert(
            //     this.currentVariant,
            //     leaf,
            //     selectedElements
            //   );
            //   inserted = true;
            // }
            if (inserted) {
              this.sortParallel(this.findParent(this.currentVariant, leaf));
            }
            // Only proceed with redraw and cache if insertion was successful
            if (!inserted) return;
            break;
          case this.insertionStrategy.replace:
            if (!this.multipleSelected) {
              this.handleReplace(this.currentVariant, leaf, selectedElement);
            }
            break;
        }
        this.triggerRedraw();
      }
      this.cacheCurrentVariant();
    }
  }

  isInsideLockedGroup(selectedElement: any): boolean {
    let parent = this.findParent(this.currentVariant, selectedElement);
    let grandParent = this.findParent(this.currentVariant, parent);
    return (
      (parent instanceof OptionalGroup &&
        grandParent instanceof ParallelGroup) ||
      (parent instanceof RepeatGroup && grandParent instanceof ParallelGroup)
    );
  }

  copyVariant(variant: VariantElement) {
    const children = variant.getElements();
    if (variant instanceof LeafNode) {
      return new LeafNode([variant.asLeafNode().activity[0]]);
    } else {
      const newChildren = [];
      for (const child of children) {
        newChildren.push(this.copyVariant(child));
      }
      variant.setElements(newChildren);
      return variant;
    }
  }

  // handleMultiParallelInsert(
  //   variant: VariantElement,
  //   leaf: VariantElement,
  //   selectedElement
  // ) {
  //   const parent = this.findParent(variant, selectedElement[0]);
  //   const grandParent = this.findParent(variant, parent); // if parent is root, grandParent is null
  //   const children = parent.getElements();
  //   if (
  //     children.length === selectedElement.length &&
  //     grandParent &&
  //     grandParent instanceof ParallelGroup
  //   ) {
  //     const parentSiblings = grandParent.getElements();
  //     parentSiblings.splice(0, 0, leaf);
  //     grandParent.setElements(parentSiblings);
  //   } else {
  //     const index = children.indexOf(selectedElement[0]);
  //     const newParent = new ParallelGroup([
  //       leaf,
  //       new SequenceGroup(selectedElement),
  //     ]);
  //     children.splice(index, selectedElement.length);
  //     children.splice(index, 0, newParent);
  //     parent.setElements(children);
  //   }
  // }

  handleParallelInsert(
    variant: VariantElement,
    leaf: VariantElement,
    selectedElement
  ) {
    const children = variant.getElements();
    if (children) {
      const index = children.indexOf(selectedElement);
      if (variant && variant === selectedElement) {
        const parent = this.findParent(this.currentVariant, selectedElement);
        if (
          parent instanceof ChoiceGroup ||
          parent instanceof FallthroughGroup
        ) {
          this.fireAlert(
            'Parallel Group Error',
            'Cannot insert Parallel Group into a Choice or Fallthrough Group.',
            'info'
          );
          return false;
        } else if (
          (selectedElement instanceof RepeatGroup ||
            selectedElement instanceof OptionalGroup) &&
          selectedElement.getElements().length > 1
        ) {
          this.fireAlert(
            'Parallel Group Error',
            'Cannot create Parallel Group with an Optional or Repeat Group with multiple children.',
            'info'
          );
          return false;
        }
        variant.setElements([
          new ParallelGroup([leaf, new SequenceGroup(children)]),
        ]);
        return true;
      } else if (index > -1) {
        // Handle parent ParallelGroup
        if (variant instanceof ParallelGroup) {
          children.splice(index, 0, leaf);
          return true;
        } else {
          // If the selected element is a parallel group, insert into its children
          if (selectedElement instanceof ParallelGroup) {
            selectedElement.getElements().push(leaf);
            return true;

            // Else create a new parallel group for leaf and selected
          } else {
            const parent = this.findParent(
              this.currentVariant,
              selectedElement
            );
            if (
              parent instanceof ChoiceGroup ||
              parent instanceof FallthroughGroup
            ) {
              this.fireAlert(
                'Parallel Group Error',
                'Cannot insert Parallel Group into a Choice or Fallthrough Group.',
                'info'
              );
              return false;
            } else if (
              (selectedElement instanceof RepeatGroup ||
                selectedElement instanceof OptionalGroup) &&
              selectedElement.getElements().length > 1
            ) {
              this.fireAlert(
                'Parallel Group Error',
                'Cannot create Parallel Group with an Optional or Repeat Group with multiple children.',
                'info'
              );
              return false;
            }
            children.splice(
              index,
              1,
              new ParallelGroup([leaf, selectedElement])
            );
            return true;
          }
        }
      } else {
        for (const child of children) {
          const result = this.handleParallelInsert(
            child,
            leaf,
            selectedElement
          );
          if (result) return result;
        }
      }
    }
    return false;
  }

  handleBehindInsert(
    variant: VariantElement,
    leaf: VariantElement,
    selectedElement
  ) {
    const children = variant.getElements();

    if (children) {
      const index = children.indexOf(selectedElement);
      if (variant && variant === selectedElement) {
        children.splice(children.length, 0, leaf);
      } else if (index > -1) {
        // Handling Parent Parallel Group Cases
        if (variant instanceof ParallelGroup) {
          // Inserting behind a leafNode inside a ParallelGroup
          if (selectedElement instanceof LeafNode) {
            children.splice(
              index,
              1,
              new SequenceGroup([selectedElement, leaf])
            );
          } else {
            // Inserting behind a ParallelGroup inside a ParallelGroup
            if (selectedElement instanceof ParallelGroup) {
              children.splice(
                children.indexOf(selectedElement),
                1,
                new SequenceGroup([selectedElement, leaf])
              );

              // Inserting behind a SequeneGroup inside a ParallelGroup
            } else {
              const selectedChildren = selectedElement.getElements();
              selectedChildren.push(leaf);
            }
          }
        } else {
          children.splice(index + 1, 0, leaf);
        }

        // Recursing into the Children
      } else {
        for (const child of children) {
          this.handleBehindInsert(child, leaf, selectedElement);
        }
      }
    }
  }

  handleInfrontInsert(
    variant: VariantElement,
    leaf: VariantElement,
    selectedElement
  ) {
    const children = variant.getElements();

    if (children) {
      const index = children.indexOf(selectedElement);
      if (variant && variant === selectedElement) {
        children.splice(0, 0, leaf);
      } else if (index > -1) {
        if (variant instanceof ParallelGroup) {
          // Inserting infront a leafNode inside a ParallelGroup
          if (selectedElement instanceof LeafNode) {
            children.splice(
              index,
              1,
              new SequenceGroup([leaf, selectedElement])
            );
          } else {
            // Inserting infront a ParallelGroup inside a ParallelGroup
            if (selectedElement instanceof ParallelGroup) {
              children.splice(
                children.indexOf(selectedElement),
                1,
                new SequenceGroup([leaf, selectedElement])
              );

              // Inserting infront a SequeneGroup inside a ParallelGroup
            } else {
              const selectedChildren = selectedElement.getElements();
              selectedChildren.unshift(leaf);
            }
          }
        } else {
          children.splice(index, 0, leaf);
        }
      } else {
        for (const child of children) {
          this.handleInfrontInsert(child, leaf, selectedElement);
        }
      }
    }
  }

  handleReplace(
    variant: VariantElement,
    leaf: VariantElement,
    selectedElement
  ) {
    const children = variant.getElements();

    if (children) {
      const index = children.indexOf(selectedElement);
      if (variant && variant === selectedElement) {
        variant.setElements([leaf]);
      }
      if (index > -1) {
        children.splice(index, 1, leaf);
      } else {
        for (const child of children) {
          this.handleReplace(child, leaf, selectedElement);
        }
      }
    }
  }

  @HostListener('window:keydown.control', ['$event'])
  onMultiSelectStart() {
    this.multiSelect = true;
  }

  @HostListener('window:keyup.control', ['$event'])
  onMultiSelectStop() {
    this.multiSelect = false;
  }

  onDeleteSelected() {
    const ElementsToDelete = this.variantEnrichedSelection
      .selectAll('.selected-variant-g')
      .data();

    if (
      ElementsToDelete.length === 1 &&
      ElementsToDelete[0] instanceof SequenceGroup &&
      this.currentVariant === ElementsToDelete[0]
    ) {
      this.onDeleteVariant();
    } // need further check. Is this nested function allowed?
    else {
      this.deleteElementFromVariant(
        this.currentVariant,
        this.currentVariant,
        ElementsToDelete
      );

      this.multiSelect = false;
      this.multipleSelected = false;

      this.cacheCurrentVariant();

      this.triggerRedraw();
    }
  }

  /** Handler for OptionalGroup creation
   *  Constraints:
   *  - Cannot be direct child of FallthroughGroup or ChoiceGroup
   *  - Cannot be nested within a single parent RepeatGroup
   *  - Cannot be applied in/on single OptionalGroup
   */
  onOptionalSelected() {
    const selectedElements = this.variantEnrichedSelection
      .selectAll('.selected-variant-g')
      .data();

    // If nothing selected, nothing to do
    if (!selectedElements || selectedElements.length === 0) {
      this.fireAlert(
        'Selection Error',
        'Please select at least one activity to apply to.',
        'info'
      );
      return;
    }

    // We want only one parent so we select just one and check if the selection is valid
    const parent = this.findParent(this.currentVariant, selectedElements[0]);
    if (!parent) return;

    const children = parent.getElements();

    if (
      parent instanceof RepeatGroup &&
      children.length === selectedElements.length
    ) {
      this.fireAlert(
        'Optional Group Error',
        'Optional groups cannot be single children of Repeat Groups.',
        'info'
      );
      return;
    }

    if (
      parent instanceof OptionalGroup &&
      children.length === selectedElements.length
    ) {
      this.fireAlert(
        'Optional Group Error',
        'Optional groups cannot be single children of Optional Groups.',
        'info'
      );
      return;
    }

    if (parent instanceof FallthroughGroup || parent instanceof ChoiceGroup) {
      this.fireAlert(
        'Optional Group Error',
        'Cannot apply optional groups within Fallthrough or Choice groups.',
        'info'
      );
      return;
    }

    // Check if parent is a ParallelGroup - special constraints apply
    if (parent instanceof ParallelGroup) {
      // Only allow single element to be made optional
      if (selectedElements.length > 1) {
        this.fireAlert(
          'Optional Group Error',
          'Optional groups within a Parallel group can only contain a single child.',
          'info'
        );
        return;
      }
      // Cannot wrap SequenceGroup or ParallelGroup in OptionalGroup within ParallelGroup
      if (
        selectedElements[0] instanceof SequenceGroup ||
        selectedElements[0] instanceof ParallelGroup
      ) {
        this.fireAlert(
          'Optional Group Error',
          'Cannot make Sequence or Parallel groups optional within a Parallel group.',
          'info'
        );
        return;
      }
      // Cannot apply optional on existing OptionalGroup or RepeatGroup within ParallelGroup
      if (
        selectedElements[0] instanceof OptionalGroup ||
        selectedElements[0] instanceof RepeatGroup
      ) {
        this.fireAlert(
          'Optional Group Error',
          'Cannot apply optional to Optional or Repeat groups within a Parallel group.',
          'info'
        );
        return;
      }
    }

    if (
      selectedElements.length === 1 &&
      selectedElements[0] instanceof OptionalGroup
    ) {
      this.fireAlert(
        'Optional Group Error',
        'Cannot apply Optional Groups on single Optional Groups.',
        'info'
      );
      return;
    }

    // The index where to insert the Group
    let first_idx = -1;
    // Check if all selected elements have the same parent and are continuous
    let current_idx = -1;
    for (const leaf of selectedElements) {
      const leaf_parent = this.findParent(this.currentVariant, leaf);
      if (parent !== leaf_parent) return;
      const idx = children.indexOf(leaf);
      if (current_idx == -1) {
        current_idx = idx;
        first_idx = idx;
      } else if (idx !== current_idx + 1) {
        // Not continuous selection
        return;
      }
      if (idx === -1) return;
    }

    // Remove selected elements from parent's children
    children.splice(first_idx, selectedElements.length);

    const operator = new OptionalGroup(selectedElements as VariantElement[]);
    operator.parent = parent;

    children.splice(first_idx, 0, operator);
    parent.setElements(children);

    // Sort if parent is a ParallelGroup
    if (parent instanceof ParallelGroup) {
      this.sortParallel(parent);
    }

    this.cacheCurrentVariant();
    this.triggerRedraw();
  }

  /** Handler for OptionalGroup creation
   *  Constraints:
   *  - Cannot be direct child of FallthroughGroup or ChoiceGroup
   *  - Cannot be applied on top of OptionalGroup
   *  - Cannot be applied on single RepeatGroup
   */
  onRepeatableSelected() {
    const selectedElements = this.variantEnrichedSelection
      .selectAll('.selected-variant-g')
      .data();

    // If nothing selected, nothing to do
    if (!selectedElements || selectedElements.length === 0) {
      this.fireAlert(
        'Selection Error',
        'Please select at least one activity to apply to.',
        'info'
      );
      return;
    }

    // We want only one parent so we select just one and check if the selection is valid
    const parent = this.findParent(this.currentVariant, selectedElements[0]);
    if (!parent) return;

    const children = parent.getElements();

    // If our selection is within an R, we do not allow nesting
    if (
      parent instanceof RepeatGroup &&
      selectedElements.length === children.length
    ) {
      this.fireAlert(
        'Repeat Group Error',
        'Repeat groups cannot be single children of Repeat Groups.',
        'info'
      );
      return;
    }

    if (parent instanceof FallthroughGroup || parent instanceof ChoiceGroup) {
      this.fireAlert(
        'Repeat Group Error',
        'Cannot apply repeat Repeat Groups within Fallthrough or Choice Groups.',
        'info'
      );
      return;
    }

    // Check if parent is a ParallelGroup - special constraints apply
    if (parent instanceof ParallelGroup) {
      // Only allow single element to be made repeatable
      if (selectedElements.length > 1) {
        this.fireAlert(
          'Repeat Group Error',
          'Repeat groups within a Parallel group can only contain a single child.',
          'info'
        );
        return;
      }
      // Cannot wrap SequenceGroup or ParallelGroup in RepeatGroup within ParallelGroup
      if (
        selectedElements[0] instanceof SequenceGroup ||
        selectedElements[0] instanceof ParallelGroup
      ) {
        this.fireAlert(
          'Repeat Group Error',
          'Cannot make Sequence or Parallel groups repeatable within a Parallel group.',
          'info'
        );
        return;
      }
      // Cannot apply repeatable on existing OptionalGroup or RepeatGroup within ParallelGroup
      if (
        selectedElements[0] instanceof OptionalGroup ||
        selectedElements[0] instanceof RepeatGroup
      ) {
        this.fireAlert(
          'Repeat Group Error',
          'Cannot apply repeat to Optional or Repeat groups within a Parallel group.',
          'info'
        );
        return;
      }
    }

    if (
      selectedElements.length === 1 &&
      selectedElements[0] instanceof RepeatGroup
    ) {
      this.fireAlert(
        'Repeat Group Error',
        'Repeat Groups cannot be single children of Repeat Groups.',
        'info'
      );
      return;
    }

    if (
      selectedElements.length === 1 &&
      selectedElements[0] instanceof OptionalGroup
    ) {
      this.fireAlert(
        'Repeat Group Error',
        'Repeat Groups cannot be single children of Optional Groups.',
        'info'
      );
      return;
    }

    // The index where to insert the Group
    let first_idx = -1;
    // Check if all selected elements have the same parent and are continuous
    let current_idx = -1;
    for (const leaf of selectedElements) {
      const leaf_parent = this.findParent(this.currentVariant, leaf);
      if (parent !== leaf_parent) return;
      const idx = children.indexOf(leaf);
      if (current_idx == -1) {
        current_idx = idx;
        first_idx = idx;
      } else if (idx !== current_idx + 1) {
        // Not continuous selection
        return;
      }
      if (idx === -1) return;
    }

    // Remove selected elements from parent's children
    children.splice(first_idx, selectedElements.length);

    const operator = new RepeatGroup(selectedElements as VariantElement[]);
    operator.parent = parent;

    children.splice(first_idx, 0, operator);
    parent.setElements(children);

    // Sort if parent is a ParallelGroup
    if (parent instanceof ParallelGroup) {
      this.sortParallel(parent);
    }

    this.cacheCurrentVariant();
    this.triggerRedraw();
  }

  /** Handler for ChoiceGroup creation
   *  Constraints:
   *  - Only a single LeafNode/WildcardNode can be selected
   *  - Cannot be inserted into
   */
  onChoiceSelected() {
    const selectedElements = this.variantEnrichedSelection
      .selectAll('.selected-variant-g')
      .data();
    // If nothing selected, nothing to do
    if (!selectedElements || selectedElements.length === 0) {
      this.fireAlert(
        'Selection Error',
        'Please select at least one activity to apply to.',
        'info'
      );
      return;
    }

    if (selectedElements.length > 1) {
      this.fireAlert(
        'Selection Error',
        'Please select just one activity to apply to.',
        'info'
      );
      return;
    }

    const leaf = selectedElements[0] as VariantElement;
    const parent = this.findParent(this.currentVariant, leaf);

    if (!parent) return;
    else if (
      parent instanceof FallthroughGroup ||
      parent instanceof ChoiceGroup
    ) {
      this.fireAlert(
        'Choice Group Error',
        'Cannot insert Group into a Fallthrough or Choice Group.',
        'info'
      );
      return;
    }

    // If selection is a single LeafNode/WildcardNode, replace it by a ChoiceGroup containing that element
    if (
      selectedElements.length === 1 &&
      (selectedElements[0] instanceof LeafNode ||
        selectedElements[0] instanceof WildcardNode)
    ) {
      const children = parent.getElements();
      const idx = children.indexOf(leaf);
      if (idx === -1) return;

      // Replace the leaf with a ChoiceGroup containing the leaf and an empty LeafNode
      const choice = new ChoiceGroup([leaf]);
      choice.parent = parent;
      children.splice(idx, 1, choice);
      parent.setElements(children);

      // Sort if parent is a ParallelGroup
      if (parent instanceof ParallelGroup) {
        this.sortParallel(parent);
      }

      this.cacheCurrentVariant();
      this.triggerRedraw();
      return;
    }
    this.fireAlert(
      'Choice Group Error',
      'A Choice Group can just contain Leaf Nodes.',
      'info'
    );
  }

  /** Handler for FallthroughGroup creation
   *  Constraints:
   *  - Can not be child of ChoiceGroup
   *  - Cannot be inserted into a FallthroughGroup
   *  - Cannot be direct child of ParallelGroup
   *  - Can just contain LeafNodes
   */
  onFallthroughSelected() {
    const selectedElements = this.variantEnrichedSelection
      .selectAll('.selected-variant-g')
      .data();
    // If nothing selected, nothing to do
    if (!selectedElements || selectedElements.length === 0) {
      this.fireAlert(
        'Selection Error',
        'Please select at least one activity to apply to.',
        'info'
      );
      return;
    }

    // We want only one parent so we select just one and check if the selection is valid
    const parent = this.findParent(this.currentVariant, selectedElements[0]);
    if (!parent) return;

    if (parent instanceof ChoiceGroup || parent instanceof ParallelGroup) {
      this.fireAlert(
        'Fallthrough Group Error',
        'Cannot insert group into a Choice or Parallel Group.',
        'info'
      );
      return;
    }

    // Check if parent is a ParallelGroup - special constraints apply
    if (this.isInsideLockedGroup(selectedElements[0])) {
      this.fireAlert(
        'Fallthrough Group Error',
        'Cannot modify Optional or Repeat groups that are children of a Parallel group.',
        'info'
      );
      return;
    }

    const children = parent.getElements();
    if (
      selectedElements.length === 1 &&
      selectedElements[0] instanceof FallthroughGroup
    ) {
      this.fireAlert(
        'Fallthrough Group Error',
        'Cannot insert group into a Fallthrough Group.',
        'info'
      );
      return;
    }

    // The index where to insert the FallthroughGroup
    let first_idx = -1;
    // Check if all selected elements have the same parent and are continuous
    let current_idx = -1;
    for (const leaf of selectedElements) {
      if (!(leaf instanceof LeafNode)) {
        this.fireAlert(
          'Fallthrough Group Error',
          'A Fallthrough Group can just contain Leaf Nodes.',
          'info'
        );
        return;
      }
      const leaf_parent = this.findParent(this.currentVariant, leaf);
      if (parent !== leaf_parent) return;
      const idx = children.indexOf(leaf);
      if (current_idx == -1) {
        current_idx = idx;
        first_idx = idx;
      } else if (idx !== current_idx + 1) {
        // Not continuous selection
        return;
      }
      if (idx === -1) return;
    }

    // Remove selected elements from parent's children
    children.splice(first_idx, selectedElements.length);

    const fallthrough = new FallthroughGroup(
      selectedElements as VariantElement[]
    );

    children.splice(first_idx, 0, fallthrough);
    parent.setElements(children);

    this.cacheCurrentVariant();
    this.triggerRedraw();
  }

  onAddWildcardSelected() {
    const leaf = new WildcardNode();
    this.insertCustomNode(leaf);
  }

  onAddAnythingOperatorSelected() {
    const leaf = new AnythingNode();
    this.insertCustomNode(leaf);
  }

  onAddStartOperatorSelected() {
    const leaf = new StartNode();
    this.insertStartEndNodes(leaf);
  }

  onAddEndOperatorSelected() {
    const leaf = new EndNode();
    this.insertStartEndNodes(leaf);
  }

  // Handler for actions emitted by the variant-modeler context menu
  onContextMenuAction(event: { action: string; value: any }) {
    if (!event || !event.action) return;

    if (event.action === 'delete') {
      this.onDeleteSelected();
    }

    if (event.action === 'repeatable') {
      this.onRepeatableSelected();
    }

    if (event.action === 'optional') {
      this.onOptionalSelected();
    }

    if (event.action === 'fallthrough') {
      this.onFallthroughSelected();
    }

    if (event.action === 'choice') {
      this.onChoiceSelected();
    }

    if (event.action === 'wildcard') {
      this.onAddWildcardSelected();
    }

    if (event.action === 'anything') {
      this.onAddAnythingOperatorSelected();
    }
    // Dont need those anymore

    if (event.action === 'start') {
      this.onAddStartOperatorSelected();
    }

    if (event.action === 'end') {
      this.onAddEndOperatorSelected();
    }
  }

  fireAlert(title: string, text: string, icon: any = 'info') {
    Swal.fire({
      title: '<tspan>' + title + '</tspan>',
      html: '<b>' + text + '</b>',
      icon: icon,
      //position: "bottom-end",
      showCloseButton: true,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'close',
      //timer: 2000,
    });
  }

  /** Handler for Start/End node creation
   *  Constraints:
   *  - Cannot have more than one Start or End node in a variant
   *  - Start node must be at the beginning of the variant
   *  - End node must be at the end of the variant
   */
  insertStartEndNodes(node: StartNode | EndNode) {
    const children = this.currentVariant.getElements();
    if (node instanceof StartNode) {
      const firstChild = children[0];
      if (firstChild instanceof StartNode) {
        this.fireAlert(
          'Node placement not valid',
          'A Start Node is already present at the beginning of the variant.',
          'info'
        );
        return;
      }
      children.splice(0, 0, node);
    } else if (node instanceof EndNode) {
      const lastChild = children[children.length - 1];
      if (lastChild instanceof EndNode) {
        this.fireAlert(
          'Node placement not valid',
          'An End Node is already present at the end of the variant.',
          'info'
        );
        return;
      }
      children.splice(children.length, 0, node);
    }
    this.currentVariant.setElements(children);
    this.triggerRedraw();
    this.cacheCurrentVariant();
  }

  insertCustomNode(node: VariantElement) {
    if (this.selectedElement || this.emptyVariant) {
      const leaf = node;
      this.newLeaf = leaf;

      // hide tooltip
      if (this.variantService.activityTooltipReference) {
        this.variantService.activityTooltipReference.tooltip('hide');
      }

      if (this.emptyVariant) {
        const variantGroup = new SequenceGroup([leaf]);
        variantGroup.setExpanded(true);
        this.currentVariant = variantGroup;
        this.emptyVariant = false;
        this.selectedElement = true;
      } else {
        leaf.setExpanded(true);
        const selectedElement = this.variantEnrichedSelection
          .selectAll('.selected-variant-g')
          .data()[0];

        // Check if trying to insert into a locked Optional/Repeat group within ParallelGroup
        if (this.isInsideLockedGroup(selectedElement)) {
          this.fireAlert(
            'Insertion Error',
            'Cannot modify Optional or Repeat groups that are children of a Parallel group.',
            'info'
          );
          return;
        }

        switch (this.selectedStrategy) {
          case this.insertionStrategy.infront:
            if (!this.multipleSelected) {
              this.handleInfrontInsert(
                this.currentVariant,
                leaf,
                selectedElement
              );
              const grandParent = this.findParent(
                this.currentVariant,
                this.findParent(this.currentVariant, leaf)
              );
              if (grandParent instanceof ParallelGroup) {
                this.sortParallel(grandParent);
              }
            }
            break;
          case this.insertionStrategy.behind:
            if (!this.multipleSelected) {
              this.handleBehindInsert(
                this.currentVariant,
                leaf,
                selectedElement
              );
              const grandParent = this.findParent(
                this.currentVariant,
                this.findParent(this.currentVariant, leaf)
              );
              if (grandParent instanceof ParallelGroup) {
                this.sortParallel(grandParent);
              }
            }
            break;
          case this.insertionStrategy.parallel:
            let inserted = false;
            if (!this.multipleSelected) {
              inserted = this.handleParallelInsert(
                this.currentVariant,
                leaf,
                selectedElement
              );
            }
            // else {
            //   const selectedElements = this.variantEnrichedSelection
            //     .selectAll('.selected-variant-g')
            //     .data();
            //   this.handleMultiParallelInsert(
            //     this.currentVariant,
            //     leaf,
            //     selectedElements
            //   );
            //   inserted = true;
            // }
            if (inserted) {
              this.sortParallel(this.findParent(this.currentVariant, leaf));
            }
            // Only proceed with redraw and cache if insertion was successful
            if (!inserted) return;
            break;
          case this.insertionStrategy.replace:
            if (!this.multipleSelected) {
              this.handleReplace(this.currentVariant, leaf, selectedElement);
            }
            break;
        }
        this.triggerRedraw();
      }
      this.cacheCurrentVariant();
    }
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

  deleteElementFromVariant(
    variant: VariantElement,
    parent: VariantElement,
    elementsToDelete
  ) {
    const children = variant.getElements();

    if (children) {
      for (const elementToDelete of elementsToDelete) {
        const index = children.indexOf(elementToDelete);
        if (index > -1) {
          this.newLeaf = children[index - 1];

          children.splice(index, 1);
        }
      }

      if (
        children.length === 1 &&
        variant instanceof SequenceGroup &&
        parent instanceof ParallelGroup &&
        (children[0] instanceof ParallelGroup ||
          children[0] instanceof LeafNode)
      ) {
        const childrenParent = parent.getElements();
        const aloneChild = children[0];
        if (aloneChild instanceof LeafNode) {
          childrenParent.splice(childrenParent.indexOf(variant), 1, aloneChild);
        } else {
          const parallelChildren = children[0].getElements();
          const deleteIndex = childrenParent.indexOf(variant);
          childrenParent.splice(deleteIndex, 1);
          for (const newNode of parallelChildren.reverse()) {
            childrenParent.splice(deleteIndex, 0, newNode);
          }
        }
        parent.setElements(childrenParent);
      } else if (
        children.length === 1 &&
        variant instanceof ParallelGroup &&
        parent instanceof SequenceGroup &&
        (children[0] instanceof SequenceGroup ||
          children[0] instanceof LeafNode)
      ) {
        const childrenParent = parent.getElements();
        const aloneChild = children[0];
        if (aloneChild instanceof LeafNode) {
          childrenParent.splice(childrenParent.indexOf(variant), 1, aloneChild);
        } else {
          const sequenceChildren = children[0].getElements();
          const deleteIndex = childrenParent.indexOf(variant);
          childrenParent.splice(deleteIndex, 1);
          for (const newNode of sequenceChildren.reverse()) {
            childrenParent.splice(deleteIndex, 0, newNode);
          }
        }
        parent.setElements(childrenParent);
      }

      // edited
      if (children.length === 0) {
        const childrenParent = parent.getElements();
        if (!(variant === this.currentVariant)) {
          childrenParent.splice(childrenParent.indexOf(variant), 1);
          parent.setElements(childrenParent);
        } else {
          this.currentVariant = null;
          this.emptyVariant = true;
        }
      } else {
        variant.setElements(children);
        for (const child of children) {
          this.deleteElementFromVariant(child, variant, elementsToDelete);
        }
      }
    }
  }

  onDeleteVariant() {
    this.currentVariant = null;
    this.emptyVariant = true;

    this.multiSelect = false;
    this.multipleSelected = false;

    this.cacheCurrentVariant();

    this.triggerRedraw();
  }

  resetAll() {
    // Reset logic tree to initial state
    this.logicTree = {
      id: 'root',
      type: 'plus',
    };

    // Clear all variant nodes
    this.queryNodes.clear();

    // Reset current editing state
    this.currentEditingQueryId = null;
    this.currentVariant = null;
    this.emptyVariant = true;

    // Reset cache
    this.cachedVariants = [null];
    this.cacheIdx = 0;

    // Clear selections
    this.selectedElement = false;
    this.multiSelect = false;
    this.multipleSelected = false;

    // Trigger tree update
    this.onTreeUpdated(this.logicTree);

    // Trigger redraw
    this.triggerRedraw();

    // Center both editors after a short delay to allow rendering
    if (this.queryLogicTreeComponent) {
      this.queryLogicTreeComponent.recenterAfterUpdate();
    }
    // Center variant editor
    if (this.editor) {
      this.editor.centerContent(0);
    }
  }

  cacheCurrentVariant() {
    if (this.cacheIdx < this.cachedVariants.length - 1) {
      this.cachedVariants = this.cachedVariants.slice(0, this.cacheIdx + 1);
    }

    if (this.currentVariant) {
      this.cachedVariants.push(this.currentVariant.copy());
    } else {
      this.cachedVariants.push(null);
    }
    if (this.cachedVariants.length > this.cacheSize) {
      this.cachedVariants.shift();
    } else {
      if (!(this.cacheIdx == null)) {
        this.cacheIdx += 1;
      } else {
        this.cacheIdx = this.cachedVariants.length - 1;
      }
    }

    // Update the query node with the current variant state
    this.saveCurrentVariantToNode();
  }

  compareNode(node1, node2) {
    if (node1 instanceof SequenceGroup) {
      return false;
    } else if (node2 instanceof SequenceGroup) {
      return true;
    } else {
      // Check if node1 is a LeafNode
      if (
        node1 instanceof LeafNode ||
        node1 instanceof WildcardNode ||
        node1 instanceof AnythingNode
      ) {
        // Check if node2 is also a LeafNode
        if (
          node2 instanceof LeafNode ||
          node2 instanceof WildcardNode ||
          node2 instanceof AnythingNode
        ) {
          return (
            node1.asLeafNode().activity[0] > node2.asLeafNode().activity[0]
          );
        } else {
          // node1 is leaf, node2 is a group -> leaf comes after groups
          return true;
        }
      } else {
        // node1 is a group (Choice, Optional, Repeat, etc.)
        if (
          node2 instanceof LeafNode ||
          node2 instanceof WildcardNode ||
          node2 instanceof AnythingNode
        ) {
          // node1 is group, node2 is leaf -> group comes before leaves
          return false;
        } else {
          // Both are groups - maintain current order
          return false;
        }
      }
    }
  }

  sortParallel(variant) {
    const children = variant.getElements();
    for (let i = 1; i < children.length; i++) {
      const temp = children[i];
      let j = i - 1;
      while (j >= 0 && this.compareNode(children[j], temp)) {
        children[j + 1] = children[j];
        j--;
      }
      children[j + 1] = temp;
    }
    return children;
  }

  findParent(parent, node) {
    const children = parent.getElements();
    if (!children) {
      return null;
    } else {
      const index = children.indexOf(node);
      if (index > -1) {
        return parent;
      } else {
        for (const child of children) {
          if (this.findParent(child, node) != null) {
            return this.findParent(child, node);
          }
        }
        return null;
      }
    }
  } // check is node is a child of parent

  checkOverlapInsert() {
    if (this.emptyVariant || !this.variantEnrichedSelection) {
      return false;
    } else {
      const selectedElement = this.variantEnrichedSelection
        .selectAll('.selected-variant-g')
        .data()[0];
      const parent = this.findParent(this.currentVariant, selectedElement);
      if (parent && !(parent instanceof ParallelGroup)) {
        return false;
      } else {
        if (!parent) {
          return false;
        } else {
          const siblings = parent.getElements();
          for (const s of siblings) {
            if (s instanceof SequenceGroup && s.getElements().length > 1) {
              return true;
            }
          }
          return false;
        }
      }
    }
  }

  checkNeighborSelection() {
    const selectedElements = this.variantEnrichedSelection
      .selectAll('.selected-variant-g')
      .data();

    if (
      !(
        this.findParent(this.currentVariant, selectedElements[0]) instanceof
        SequenceGroup
      )
    ) {
      return false;
    }

    for (let i = 0; i < selectedElements.length - 1; i++) {
      const firstParent = this.findParent(
        this.currentVariant,
        selectedElements[i]
      );
      const secondParent = this.findParent(
        this.currentVariant,
        selectedElements[i + 1]
      );
      if (
        firstParent != secondParent ||
        firstParent.getElements().indexOf(selectedElements[i + 1]) !=
          firstParent.getElements().indexOf(selectedElements[i]) + 1
      ) {
        return false;
      }
    }
    return true;
  }

  removeSelection() {
    this.selectedElement = false;
    this.multiSelect = false;
    this.multipleSelected = false;

    this.triggerRedraw();
    this.newLeaf = null;
  }

  redo() {
    this.selectedElement = false;
    this.emptyVariant = false;

    this.cacheIdx++;
    if (this.cachedVariants[this.cacheIdx] === null) {
      this.currentVariant = null;
      this.emptyVariant = true;
    } else {
      this.currentVariant = this.cachedVariants[this.cacheIdx].copy();
    }
    this.newLeaf = null;
  }

  undo() {
    this.selectedElement = false;
    this.emptyVariant = false;

    this.cacheIdx--;
    if (this.cachedVariants[this.cacheIdx] === null) {
      this.currentVariant = null;
      this.emptyVariant = true;
    } // edited
    else {
      this.currentVariant = this.cachedVariants[this.cacheIdx].copy();
    }
    this.newLeaf = null;
  }

  // This is a work-around that we should address in a more unified manner
  // The underlying challenge is causing a redraw by triggering change detection,
  // something that in its current state due to only a shallow check of the VariantElement
  triggerRedraw() {
    setTimeout(() => this.variantDrawer.redraw(), 1);
  }

  focusSelected() {
    this.editor.focusSelected(250);
  }

  centerVariant() {
    this.editor.centerContent(250);
  }

  computeFocusOffset = (svg) => {
    const path = findPathToSelectedNode(
      this.currentVariant,
      svg.select('.selected-variant-g').data()[0]
    ).slice(1);
    let translateX = 0;

    for (const element of svg
      .selectAll('g')
      .filter((d: VariantElement) => {
        return path.indexOf(d) > -1;
      })
      .nodes()) {
      const transform = d3
        .select(element)
        .attr('transform')
        .match(/[\d.]+/g);
      translateX += parseFloat(transform[0]);
    }

    return [-translateX, 0];
  };

  onFilterVariants() {
    const current = this.currentVariant;
    //this.variantService.variants = [];
    let variantQuery = current.serialize(1);
    const observable = this.backendService.visualQuery(
      variantQuery,
      this.queryType
    );
    observable.subscribe((res) => {
      const variant_ids = res;
      const variants = [];
      this.variantFilterService.addVariantFilter(
        'query filter',
        new Set(res as Array<number>),
        'Testing variant query filter'
      );
    });
  }

  onFilterCurrentQuery() {
    // Filter using only the currently selected query
    if (this.currentEditingQueryId === null || !this.currentVariant) {
      return;
    }

    const variantQuery = this.currentVariant.serialize(1);
    const observable = this.backendService.visualQuery(
      variantQuery,
      this.queryType
    );
    observable.subscribe((res) => {
      this.variantFilterService.addVariantFilter(
        `Query #${this.currentEditingQueryId} filter`,
        new Set(res as Array<number>),
        `Filter based on Query #${this.currentEditingQueryId}`
      );
    });
  }

  checkForTreeCompleteness(node: LogicTreeNode): boolean {
    if (!node) return true;

    if (node.type === 'plus') {
      return false;
    }

    if (node.children) {
      for (const child of node.children) {
        if (!this.checkForTreeCompleteness(child)) {
          return false;
        }
      }
    }

    return true;
  }

  togglePreview() {
    this.previewMode = !this.previewMode;
  }

  isFilterable(): boolean {
    if (this.logicTree === null) {
      return false;
    }

    // Ensure there is no plus node left
    if (!this.checkForTreeCompleteness(this.logicTree)) {
      return false;
    }

    for (const node of this.queryNodes.values()) {
      if (node.variantElement === null || node.variantElement === undefined) {
        return false;
      }
    }
    return true;
  }

  transformLogicTreeToQuery(node: LogicTreeNode): any {
    if (node.type === 'query') {
      const variantElement = this.queryNodes.get(node.queryId).variantElement;
      if (variantElement) {
        return { type: node.type, pattern: variantElement.serialize(1) };
      } else {
        return null;
      }
    } else {
      const childrenQueries = [];
      for (const child of node.children) {
        const childQuery = this.transformLogicTreeToQuery(child);
        if (childQuery) {
          childrenQueries.push(childQuery);
        }
      }
      if (childrenQueries.length === 0) {
        return null;
      }
      return {
        type: node.type,
        children: childrenQueries,
      };
    }
  }

  onFilterLogicTree() {
    // Filter using only the currently selected query
    if (this.logicTree === null) {
      return;
    }

    this.saveCurrentVariantToNode();
    const query = this.transformLogicTreeToQuery(this.logicTree);

    const observable = this.backendService.visualQueryLogical(
      query,
      this.queryType
    );

    observable.subscribe((res) => {
      this.variantFilterService.addVariantFilter(
        `Logic Query filter`,
        new Set(res as Array<number>),
        `Filter based on Query Logic Tree`
      );
    });
  }

  onTreeUpdated(updatedTree: LogicTreeNode) {
    this.logicTree = updatedTree;
  }

  onQueryCreated(event: { node: LogicTreeNode; queryId: number }) {
    const { node, queryId } = event;
    // Store the variant node
    this.queryNodes.set(queryId, node);
  }

  saveCurrentVariantToNode() {
    const id = this.currentEditingQueryId;
    if (id !== null && this.queryNodes.has(id)) {
      const node = this.queryNodes.get(id);
      if (node) {
        // Deep clone to ensure we capture the current state
        node.variantElement = cloneDeep(this.currentVariant);
      }
    }
  }

  selectVariantForEditing(queryId: number, node: LogicTreeNode) {
    this.saveCurrentVariantToNode();
    // Load the new variant into the main editor
    this.currentEditingQueryId = queryId;

    // Check if variant has content or is empty
    if (node.variantElement) {
      // Deep clone when loading to avoid reference issues
      this.currentVariant = cloneDeep(node.variantElement);
      this.emptyVariant = false;
    } else {
      this.currentVariant = null;
      this.emptyVariant = true;
    }

    // Reset the cache with the new variant
    this.cachedVariants = [
      this.currentVariant ? cloneDeep(this.currentVariant) : null,
    ];
    this.cacheIdx = 0;

    // Clear selection
    this.selectedElement = null;
    this.multipleSelected = false;

    if (this.variantDrawer) {
      this.variantDrawer.redraw();
    }

    if (this.editor) {
      this.editor.centerContent(0);
    }
  }

  applySortOnVariantQueryModeler() {
    const variantExplorerRef =
      this.goldenLayoutComponentService.goldenLayout.findFirstComponentItemById(
        VariantExplorerComponent.componentName
      );
    const variantExplorer =
      variantExplorerRef.component as VariantExplorerComponent;
    variantExplorer.sortingFeature = 'userDefined';
    variantExplorer.onSortOrderChanged(false);
  }
}

export namespace VariantQueryModelerComponent {
  export const componentName = 'VariantQueryModelerComponent';
}

export enum activityInsertionStrategy {
  infront = 'infront',
  behind = 'behind',
  parallel = 'parallel',
  replace = 'replace',
}
