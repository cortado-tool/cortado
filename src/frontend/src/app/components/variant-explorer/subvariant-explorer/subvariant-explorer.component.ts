import { ColorMapService } from '../../../services/colorMapService/color-map.service';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ComponentContainer, LogicalZIndex } from 'golden-layout';
import { SubVariantComponent } from './subvariants/sub-variant/sub-variant.component';
import { ImageExportService } from 'src/app/services/imageExportService/image-export-service';
import { PolygonDrawingService } from 'src/app/services/polygon-drawing.service';
import * as d3 from 'd3';
import { LogService } from 'src/app/services/logService/log.service';
import { LayoutChangeDirective } from 'src/app/directives/layout-change/layout-change.directive';
import { VariantDrawerDirective } from 'src/app/directives/variant-drawer/variant-drawer.directive';
import {
  deserialize,
  LeafNode,
  VariantElement,
} from 'src/app/objects/Variants/variant_element';
import { Variant } from 'src/app/objects/Variants/variant';
import { BackendService } from 'src/app/services/backendService/backend.service';
import { VariantPerformanceService } from 'src/app/services/variant-performance.service';
import { SubvariantVisualization } from 'src/app/objects/Variants/subvariant';
import { VariantViewModeService } from 'src/app/services/viewModeServices/variant-view-mode.service';
import { ViewMode } from 'src/app/objects/ViewMode';
import { activityColor } from '../functions/variant-drawer-callbacks';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  AlignmentType,
  ConformanceCheckingService,
} from 'src/app/services/conformanceChecking/conformance-checking.service';
import { ProcessTreeService } from 'src/app/services/processTreeService/process-tree.service';
import { IVariant } from 'src/app/objects/Variants/variant_interface';
import { LoopCollapsedVariant } from 'src/app/objects/Variants/loop_collapsed_variant';

@Component({
  selector: 'app-subvariant-explorer',
  templateUrl: './subvariant-explorer.component.html',
  styleUrls: ['./subvariant-explorer.component.css'], // Consider also importing the base style from the normal variant explorer scss
})
export class SubvariantExplorerComponent
  extends LayoutChangeDirective
  implements AfterViewInit, OnInit, OnDestroy
{
  mainVariant: Variant;
  containsLoopCollapsedVariants: boolean = false;
  subvariants = new Map<Variant, any>();
  public colorMap: Map<string, string>;
  public serviceTimeColorMap: any;
  public waitingTimeColorMap: any;
  public index: number;

  @ViewChildren(VariantDrawerDirective)
  mainvariantDrawers: QueryList<VariantDrawerDirective>;

  @ViewChildren(SubVariantComponent)
  subVariantComponents: QueryList<SubVariantComponent>;

  public sortAscending: boolean;
  public svgRenderingInProgress: boolean;

  private _destroy$ = new Subject();

  constructor(
    @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken)
    private container: ComponentContainer,
    elRef: ElementRef,
    renderer: Renderer2,
    private colorMapService: ColorMapService,
    private logService: LogService,
    private imageExportService: ImageExportService,
    private polygonDrawingService: PolygonDrawingService,
    private backendService: BackendService,
    public variantPerformanceService: VariantPerformanceService,
    public variantViewModeService: VariantViewModeService,
    private conformanceCheckingService: ConformanceCheckingService,
    private processTreeService: ProcessTreeService
  ) {
    super(elRef.nativeElement, renderer);
    let state = this.container.initialState;
    this.mainVariant = state['variant'] as IVariant;
    this.index = state['index'] as number;
    this.colorMap = this.colorMapService.colorMap;
    this.sortAscending = false;
    this.svgRenderingInProgress = false;
    this.serviceTimeColorMap =
      variantPerformanceService.serviceTimeColorMap.getValue();
    this.waitingTimeColorMap =
      variantPerformanceService.waitingTimeColorMap.getValue();
  }

  ngOnInit(): void {
    let underlyingVariants = [];
    if (this.mainVariant instanceof LoopCollapsedVariant) {
      underlyingVariants = this.mainVariant.variants;
    } else {
      underlyingVariants.push(this.mainVariant);
    }

    underlyingVariants.forEach((v) => {
      this.backendService
        .getSubvariantsForVariant(v.bid)
        .pipe(takeUntil(this._destroy$))
        .subscribe((subvariant) => {
          this.addSubvariantToVariant(v, subvariant);
        });
    });
  }

  addSubvariantToVariant(variant, subvariant) {
    if (this.subvariants.has(variant)) {
      this.subvariants.get(variant).push(subvariant);
    } else {
      this.subvariants.set(variant, [subvariant]);
    }

    if (variant.variant.asString() !== this.mainVariant.variant.asString()) {
      this.containsLoopCollapsedVariants = true;
    }
  }

  ngAfterViewInit() {
    this.colorMapService.colorMap$
      .pipe(takeUntil(this._destroy$))
      .subscribe((cMap) => {
        this.colorMap = cMap;
        this.mainvariantDrawers.forEach((d) => d.redraw());
      });

    this.variantPerformanceService.serviceTimeColorMap
      .pipe(takeUntil(this._destroy$))
      .subscribe((colorMap) => {
        if (colorMap !== undefined) {
          this.serviceTimeColorMap = colorMap;
          this.mainvariantDrawers.forEach((d) => d.redraw());
        }
      });

    this.variantPerformanceService.waitingTimeColorMap
      .pipe(takeUntil(this._destroy$))
      .subscribe((colorMap) => {
        if (colorMap !== undefined) {
          this.waitingTimeColorMap = colorMap;
          this.mainvariantDrawers.forEach((d) => d.redraw());
        }
      });

    this.variantViewModeService.viewMode$
      .pipe(takeUntil(this._destroy$))
      .subscribe((viewMode: ViewMode) => {
        this.onViewModeChange(viewMode);
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  // Implements responsive changes, such as triggering animations, if the layout and thus the components size changes
  handleResponsiveChange(
    left: number,
    top: number,
    width: number,
    height: number
  ): void {}

  handleVisibilityChange(visibility: boolean): void {
    if (visibility && this.mainvariantDrawers) {
      this.mainvariantDrawers.forEach((d) => d.redraw());
      this.subVariantComponents.forEach((svc) => svc.draw());
    }
  }
  handleZIndexChange(
    logicalZIndex: LogicalZIndex,
    defaultZIndex: string
  ): void {}

  public setIndex(index: number) {
    this.index = index;
  }

  subvariantClickCallBack(vis: SubvariantVisualization) {
    this.mainvariantDrawers.forEach((d) => d.changeSelected(null));
    this.subVariantComponents.forEach((svc) => svc.changeSelection(vis));
  }

  public toggleExpanded() {
    if (this.variantViewModeService.viewMode === ViewMode.PERFORMANCE) {
      return;
    }
    let expanded = this.mainVariant.variant.expanded;
    this.mainvariantDrawers.forEach((d) => d.setExpanded(!expanded));
    this.setExpandedSubVariants(!expanded);
  }

  public setExpandedSubVariants(expanded) {
    this.subVariantComponents.forEach((svc) => svc.setExpanded(expanded));
  }

  variantClickCallBack = (
    drawer: VariantDrawerDirective,
    element: VariantElement,
    variant: VariantElement
  ) => {
    this.toggleExpanded();
    if (this.variantViewModeService.viewMode === ViewMode.PERFORMANCE) {
      drawer.changeSelected(element);
      this.subVariantComponents.forEach((svc) => svc.changeSelection(null));
      if (element.serviceTime) {
        this.variantPerformanceService.setPerformanceStatsSelectedVariantElement(
          element.serviceTime,
          true
        );
      }
      if (element.waitingTime) {
        this.variantPerformanceService.setPerformanceStatsSelectedVariantElement(
          element.waitingTime,
          false
        );
      }
    }
  };

  toggleSortOrder(): void {
    this.sortAscending = !this.sortAscending;
    this.sortSubvariants('count');
  }

  sortSubvariants(sortAttribute: string): void {
    const order = this.sortAscending ? 1 : -1;
    const subvariantSortFunction = (a, b) => {
      if (a[0][sortAttribute] < b[0][sortAttribute]) {
        return -order;
      } else if (a[0][sortAttribute] > b[0][sortAttribute]) {
        return order;
      } else return order;
    };

    this.subvariants.forEach((v, _) => {
      v.sort(subvariantSortFunction);
    });
  }

  exportSubvariantSVG(): void {
    // Prepare an array for the svg elements
    let svgs: SVGGraphicsElement[] = [];

    // Temporarily expand all subvariants
    let expanded = this.mainVariant.variant.expanded;
    if (!expanded) {
      this.toggleExpanded();
    }

    // Turn on the rendering spinner
    this.svgRenderingInProgress = true;

    let mainVarDrawer = this.mainvariantDrawers.filter(
      (v) => v.variant == this.mainVariant
    )[0];
    // Add the main variant to the SVG array
    const mainVariantSVG = this.addVariantExportInformation(
      mainVarDrawer.getSVGGraphicElement(),
      100,
      100,
      true
    );
    svgs.push(mainVariantSVG);

    // Temporarily change text color to black for readability in the svg
    this.subVariantComponents.forEach((svc) => svc.draw('black'));

    // Insert the subvariants svg to the array
    this.subVariantComponents.forEach((svc) =>
      svgs.push(svc.svgElement.nativeElement)
    );

    // Prepare frequency informations of the subvariants
    const counts = [];
    const percentages = [];
    for (let subVariant of this.subvariants) {
      counts.push(subVariant[0].count);
      percentages.push(subVariant[0].percentage);
    }

    // Add frequency informations of the subvariants
    // The first svg is the main variant, so index starts from 1
    for (let i = 1; i < svgs.length; i++) {
      svgs[i] = this.addVariantExportInformation(
        svgs[i],
        counts[i - 1],
        percentages[i - 1],
        false
      );
    }

    // Draw the legend and insert it to the start of the svg array
    const legend = d3.create('svg').attr('x', '10').attr('y', '10');
    let leafnodes: LeafNode[] = [];
    for (let activity in this.logService.activitiesInEventLog) {
      leafnodes.push(new LeafNode([activity]));
    }
    this.polygonDrawingService.drawLegend(
      leafnodes,
      legend,
      this.colorMap,
      'Subvariants'
    );
    svgs.unshift(legend.node());

    // Export to an SVG file
    this.imageExportService.export(
      `subvariants-for-${this.mainVariant.bid}`,
      0,
      0,
      ...svgs
    );

    // Reset everything back to normal
    if (!expanded) {
      this.toggleExpanded();
    }
    this.subVariantComponents.forEach((svc) => svc.draw('whitesmoke'));

    // Turn off the spinner
    this.svgRenderingInProgress = false;
  }

  addVariantExportInformation(
    svgElement: any,
    variantAbs: number,
    variantPerc: number,
    mainVariant: boolean = false
  ): SVGGraphicsElement {
    const exportMarginX: number = 80;
    const exportMarginY: number = 15;

    const svgElement_copy = svgElement.cloneNode(true) as SVGGraphicsElement;

    // Shift all Elements to the right using transform chaining
    svgElement_copy.setAttribute(
      'width',
      (svgElement.clientWidth + exportMarginX).toString()
    );
    svgElement_copy.setAttribute(
      'height',
      (svgElement.clientHeight + exportMarginY).toString()
    );

    d3.select(svgElement_copy)
      .selectChildren()
      .each(function (this: SVGGraphicsElement) {
        this.setAttribute(
          'transform',
          (this.getAttribute('transform')
            ? this.getAttribute('transform') + ','
            : '') + `translate(${exportMarginX}, 0)`
        );
      });

    // Add text field to the left of the variants
    const textfield = d3
      .select(svgElement_copy)
      .append('text')
      .attr(
        'transform',
        `translate(20, ${(svgElement.clientHeight - 25) / 2 + 10})`
      )
      .attr('height', 20)
      .attr('width', 50)
      .attr('font-size', 9)
      .attr('fill', 'black');

    if (!mainVariant) {
      // If the variant is not the main variant, then add frequency informations
      textfield
        .append('tspan')
        .attr('x', 0)
        .attr('dy', -7)
        .attr('height', 9)
        .attr('fill', 'black')
        .text(variantPerc + '%');

      textfield
        .append('tspan')
        .attr('x', 0)
        .attr('dy', 10)
        .attr('height', 9)
        .attr('fill', 'black')
        .text('(' + variantAbs + ')');
    } else {
      // If the variant is the main variant, add an indicating text next to it
      textfield
        .append('tspan')
        .attr('x', 0)
        .attr('dy', 8)
        .attr('height', 9)
        .attr('fill', 'black')
        .attr('font-size', 14)
        .text('Parent');
    }
    return svgElement_copy;
  }

  private onViewModeChange(viewMode: ViewMode) {
    switch (viewMode) {
      case ViewMode.PERFORMANCE:
        this.setExpandedSubVariants(true);
        break;
      default:
        if (!this.mainVariant.variant.expanded)
          this.setExpandedSubVariants(false);
        break;
    }
  }

  computeActivityColor = activityColor.bind(this);

  updateConformanceForSingleVariantClicked(variant: Variant): void {
    if (variant.isTimeouted) {
      this.conformanceCheckingService.showConformanceTimeoutDialog(
        variant,
        this.updateConformanceForVariant.bind(this)
      );
    } else {
      this.updateConformanceForVariant(variant, 0);
    }
  }

  updateConformanceForVariant(variant: IVariant, timeout: number): void {
    let underlyingVariants = [];
    if (variant instanceof LoopCollapsedVariant) {
      underlyingVariants = variant.variants;
    } else {
      underlyingVariants = [variant];
    }

    underlyingVariants.forEach((v) => {
      v.calculationInProgress = true;
      v.deviations = undefined;

      this.conformanceCheckingService.calculateConformance(
        v.id,
        v.infixType,
        this.processTreeService.currentDisplayedProcessTree,
        v.variant.serialize(1),
        timeout,
        AlignmentType.VariantAlignment
      );
    });
  }
}

export namespace SubvariantExplorerComponent {
  export const componentName = 'SubvariantExplorerComponent';
}
