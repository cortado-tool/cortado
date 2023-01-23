import { ZoomFieldComponent } from './../zoom-field/zoom-field.component';
import { VariantService } from './../../services/variantService/variant.service';
import { VariantExplorerComponent } from './../variant-explorer/variant-explorer.component';
import { GoldenLayoutComponentService } from './../../services/goldenLayoutService/golden-layout-component.service';
import { ColorMapService } from './../../services/colorMapService/color-map.service';
import { ComponentContainer, LogicalZIndex } from 'golden-layout';
import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
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
import * as objectHash from 'object-hash';
import * as d3 from 'd3';
import { LogService } from 'src/app/services/logService/log.service';
import { LayoutChangeDirective } from 'src/app/directives/layout-change/layout-change.directive';
import { VariantDrawerDirective } from 'src/app/directives/variant-drawer/variant-drawer.directive';
import { InfixType, setParent } from 'src/app/objects/Variants/infix_selection';
import { Variant } from 'src/app/objects/Variants/variant';
import {
  VariantElement,
  LeafNode,
  SequenceGroup,
  ParallelGroup,
} from 'src/app/objects/Variants/variant_element';
import { collapsingText, fadeInText } from 'src/app/animations/text-animations';
import { findPathToSelectedNode } from 'src/app/objects/Variants/utility_functions';
import { applyInverseStrokeToPoly } from 'src/app/utils/render-utils';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-variant-editor',
  templateUrl: './variant-editor.component.html',
  styleUrls: ['./variant-editor.component.css'],
  animations: [fadeInText, collapsingText],
})
export class VariantEditorComponent
  extends LayoutChangeDirective
  implements OnInit, OnDestroy
{
  activityNames: Array<String> = [];

  public colorMap: Map<string, string>;

  variantEditorComponent = VariantEditorComponent;

  @ViewChild('VariantMainGroup')
  variantElement: ElementRef;

  @ViewChild(ZoomFieldComponent)
  editor: ZoomFieldComponent;

  @ViewChild(VariantDrawerDirective)
  variantDrawer: VariantDrawerDirective;

  currentVariant: VariantElement = null;

  cachedVariants: VariantElement[] = [];
  cacheSize: number = 100;
  cacheIdx: number = 0;

  emptyVariant: boolean = true;

  selectedElement = false;
  multiSelect = false;
  multipleSelected = false;

  infixType = InfixType;
  curInfixType = InfixType.NOT_AN_INFIX;

  newLeaf;

  collapse: boolean = false;

  insertionStrategy = activityInsertionStrategy;
  selectedStrategy = this.insertionStrategy.behind;

  variantEnrichedSelection: Selection<any, any, any, any>;
  zoom: any;

  redundancyWarning: boolean = false;

  private _destroy$ = new Subject();

  constructor(
    private sharedDataService: SharedDataService,
    private logService: LogService,
    private variantService: VariantService,
    private colorMapService: ColorMapService,
    @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken)
    private container: ComponentContainer,
    private goldenLayoutComponentService: GoldenLayoutComponentService,
    elRef: ElementRef,
    renderer: Renderer2
  ) {
    super(elRef.nativeElement, renderer);
    const activitites = this.logService.activitiesInEventLog;

    for (let activity in activitites) {
      this.activityNames.push(activity);
      this.activityNames.sort();
    }
  }

  ngOnInit(): void {
    this.logService.activitiesInEventLog$
      .pipe(takeUntil(this._destroy$))
      .subscribe((activities) => {
        this.activityNames = [];
        for (let activity in activities) {
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
    if (width < 1150) this.collapse = true;
    else {
      this.collapse = false;
    }
  }

  handleVisibilityChange(visibility: boolean): void {}
  handleZIndexChange(
    logicalZIndex: LogicalZIndex,
    defaultZIndex: string
  ): void {}

  handleRedraw(selection: Selection<any, any, any, any>) {
    selection.selectAll('g').on('click', function (event, d) {
      event.stopPropagation();
      const select = d3.select(this as SVGElement);
      toogleSelect(select);
    });

    const toogleSelect = function (svgSelection) {
      if (!this.multiSelect) {
        d3.select('#VariantMainGroup')
          .selectAll('.selected-variant-poly')
          .classed('selected-variant-poly', null)
          .attr('stroke', null);

        d3.select('#VariantMainGroup')
          .selectAll('.selected-variant-g')
          .classed('selected-variant-g', false);

        svgSelection.classed('selected-variant-g', true);

        const poly = svgSelection.select('polygon');
        poly.classed('selected-variant-poly', true);
        applyInverseStrokeToPoly(poly);

        this.multipleSelected = false;
      } else {
        this.multipleSelected = true;

        svgSelection.classed(
          'selected-variant-g',
          !svgSelection.classed('selected-variant-g')
        );

        const poly = svgSelection.select('polygon');

        poly.classed(
          'selected-variant-poly',
          !poly.classed('selected-variant-poly')
        );

        if (!poly.attr('stroke')) {
          applyInverseStrokeToPoly(poly);
        } else {
          poly.attr('stroke', null);
        }

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

    const poly = selection
      .selectAll('.selected-variant-g')
      .select('polygon')
      .classed('selected-variant-poly', true);

    applyInverseStrokeToPoly(poly);

    this.variantEnrichedSelection = selection;
  }

  handleActivityButtonClick(event) {
    if (!this.multipleSelected && (this.selectedElement || this.emptyVariant)) {
      const leaf = new LeafNode([event.activityName]);
      this.newLeaf = leaf;

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

        switch (this.selectedStrategy) {
          case this.insertionStrategy.infront:
            this.handleInfrontInsert(
              this.currentVariant,
              leaf,
              selectedElement
            );
            break;
          case this.insertionStrategy.behind:
            this.handleBehindInsert(this.currentVariant, leaf, selectedElement);
            break;
          case this.insertionStrategy.parallel:
            this.handleParallelInsert(
              this.currentVariant,
              leaf,
              selectedElement
            );
            break;
          case this.insertionStrategy.replace:
            this.handleReplace(this.currentVariant, leaf, selectedElement);
            break;
        }
        this.triggerRedraw();
      }

      this.cacheCurrentVariant();
    }
  }

  handleParallelInsert(
    variant: VariantElement,
    leaf: LeafNode,
    selectedElement
  ) {
    const children = variant.getElements();

    if (children) {
      const index = children.indexOf(selectedElement);

      if (index > -1) {
        // Handle parent ParallelGroup
        if (variant instanceof ParallelGroup) {
          children.splice(index, 0, leaf);
        } else {
          // If the selected element is a parallel group, insert into its children
          if (selectedElement instanceof ParallelGroup) {
            selectedElement.getElements().push(leaf);

            // Else create a new parallel group for leaf and selected
          } else {
            children.splice(
              index,
              1,
              new ParallelGroup([leaf, selectedElement])
            );
          }
        }

        //variant.setElements(children);
      } else {
        for (let child of children) {
          this.handleParallelInsert(child, leaf, selectedElement);
        }
      }
    }
  }

  handleInfixButtonClick(infixtype: InfixType) {
    this.curInfixType = infixtype;
  }

  handleBehindInsert(variant: VariantElement, leaf: LeafNode, selectedElement) {
    const children = variant.getElements();

    if (children) {
      const index = children.indexOf(selectedElement);

      if (index > -1) {
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

          // Else the variant is a SequenceGroup and we can simply insert after the selected Element
        } else {
          children.splice(index + 1, 0, leaf);
        }

        // Recursing into the Children
      } else {
        for (let child of children) {
          this.handleBehindInsert(child, leaf, selectedElement);
        }
      }
    }
  }

  handleInfrontInsert(
    variant: VariantElement,
    leaf: LeafNode,
    selectedElement
  ) {
    const children = variant.getElements();

    if (children) {
      const index = children.indexOf(selectedElement);
      if (index > -1) {
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
        for (let child of children) {
          this.handleInfrontInsert(child, leaf, selectedElement);
        }
      }
    }
  }

  handleReplace(variant: VariantElement, leaf: LeafNode, selectedElement) {
    const children = variant.getElements();

    if (children) {
      const index = children.indexOf(selectedElement);

      if (index > -1) {
        children.splice(index, 1, leaf);
      } else {
        for (let child of children) {
          this.handleReplace(child, leaf, selectedElement);
        }
      }
    }
  }

  @HostListener('window:keydown.control', ['$event'])
  onMultiSelectStart(e) {
    this.multiSelect = true;
  }

  @HostListener('window:keyup.control', ['$event'])
  onMultiSelectStop(e) {
    this.multiSelect = false;
  }

  onDeleteSelected() {
    const ElementsToDelete = this.variantEnrichedSelection
      .selectAll('.selected-variant-g')
      .data();

    this.deleteElementFromVariant(
      this.currentVariant,
      this.currentVariant,
      ElementsToDelete
    );

    this.multiSelect = false;
    this.multipleSelected = false;

    if (this.currentVariant) {
      this.cacheCurrentVariant();
    }
    this.triggerRedraw();
  }

  computeActivityColor = (
    self: VariantDrawerDirective,
    element: VariantElement,
    variant: Variant
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
      for (let elementToDelete of elementsToDelete) {
        const index = children.indexOf(elementToDelete);
        if (index > -1) {
          this.newLeaf = children[index - 1];

          children.splice(index, 1);
        }
      }

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
        for (let child of children) {
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

    this.triggerRedraw();
  }

  cacheCurrentVariant() {
    if (this.cacheIdx < this.cachedVariants.length - 1) {
      this.cachedVariants = this.cachedVariants.slice(0, this.cacheIdx + 1);
    }

    this.cachedVariants.push(this.currentVariant.copy());
    if (this.cachedVariants.length > this.cacheSize) {
      this.cachedVariants.shift();
    } else {
      if (!(this.cacheIdx == null)) {
        this.cacheIdx += 1;
      } else {
        this.cacheIdx = this.cachedVariants.length - 1;
      }
    }
  }

  redo() {
    this.selectedElement = false;
    this.emptyVariant = false;

    this.cacheIdx++;
    this.currentVariant = this.cachedVariants[this.cacheIdx].copy();
    this.newLeaf = null;
  }

  undo() {
    this.selectedElement = false;
    this.emptyVariant = false;

    this.cacheIdx--;
    this.currentVariant = this.cachedVariants[this.cacheIdx].copy();
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

    for (let element of svg
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

  addCurrentVariantToVariantList() {
    let currentVariants = this.variantService.variants;
    const copyCurrent = cloneDeep(this.currentVariant);
    setParent(copyCurrent);
    copyCurrent.setExpanded(false);

    const newVariant = new Variant(
      1,
      copyCurrent,
      false,
      true,
      false,
      0,
      undefined,
      true,
      false,
      true,
      0,
      this.curInfixType
    );

    newVariant.alignment = undefined;
    newVariant.deviations = undefined;
    newVariant.id = objectHash(newVariant);

    this.variantService.nUserVariants += 1;
    newVariant.bid = -this.variantService.nUserVariants;

    const duplicate = currentVariants.map((v) => v.id === newVariant.id);

    if (!duplicate.includes(true)) {
      currentVariants.push(newVariant);
      this.addStatistics(newVariant).subscribe(() => {
        // set new variants list after adding statistics
        this.variantService.variants = currentVariants;
      });
      this.variantService.addUserDefinedVariant(
        newVariant.variant,
        newVariant.bid
      );
    } else {
      this.redundancyWarning = true;
      setTimeout(() => (this.redundancyWarning = false), 500);
    }

    this.applySortOnVariantEditor();
  }

  private addStatistics(newVariant: Variant): Observable<any> {
    if (newVariant.infixType != InfixType.NOT_AN_INFIX) {
      return this.variantService.countFragmentOccurrences(newVariant).pipe(
        tap((statistics) => {
          newVariant.fragmentStatistics = statistics;
        })
      );
    }
    return of();
  }

  applySortOnVariantEditor() {
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

export namespace VariantEditorComponent {
  export const componentName = 'VariantEditorComponent';
}

export enum activityInsertionStrategy {
  infront = 'infront',
  behind = 'behind',
  parallel = 'parallel',
  replace = 'replace',
}
