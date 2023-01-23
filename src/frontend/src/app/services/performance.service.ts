import { Injectable } from '@angular/core';
import {
  ProcessTree,
  TreePerformance,
} from '../objects/ProcessTree/ProcessTree';
import { BackendService } from './backendService/backend.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HumanizeDurationPipe } from '../pipes/humanize-duration.pipe';
import { ProcessTreeService } from './processTreeService/process-tree.service';
import { VariantService } from './variantService/variant.service';
import { Variant } from '../objects/Variants/variant';
import { ModelViewModeService } from './viewModeServices/model-view-mode.service';
import { ViewMode } from '../objects/ViewMode';

@Injectable({
  providedIn: 'root',
})
export class PerformanceService {
  mergedPerformance: ProcessTree;

  // key is variant, value is process tree
  variantsPerformance: Map<Variant, ProcessTree> = new Map<
    Variant,
    ProcessTree
  >();

  public availablePerformances: Set<Variant> = new Set<Variant>();

  // key is id of node, value is map with performance stats for each variant
  allValues: Map<number, Map<Variant, TreePerformance>> = new Map<
    number,
    Map<Variant, TreePerformance>
  >();

  allValuesMean: Map<number, TreePerformance> = new Map<
    number,
    TreePerformance
  >();

  // colorScale for each tree node;
  private activeTreePerformance: number;
  newValues: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  calculationInProgress = new Set<Variant>();
  latestRequest: Subscription;
  fitness = new Map<Variant, number>();

  private currentPt: ProcessTree;

  constructor(
    private variantService: VariantService,
    private backendService: BackendService,
    private processTreeService: ProcessTreeService,
    private modelViewModeService: ModelViewModeService
  ) {
    this.currentPt = processTreeService.currentDisplayedProcessTree;

    this.variantService.variants$.subscribe((_variants) => {
      this.clear();
    });
    processTreeService.currentDisplayedProcessTree$.subscribe((pt) => {
      if (pt) {
        this.processTreeService.selectedTree = pt;
      } else {
        this.clear();
        this.processTreeService.selectedTree = undefined;
        this.currentPt = undefined;
        return;
      }

      if (
        !this.currentPt?.equals(pt) ||
        (this.currentPt.equals(pt) &&
          !pt.performance &&
          this.currentPt.performance)
      ) {
        this.clear();
        this.currentPt = pt;
      }
    });
  }

  public removeAll() {
    this.updatePerformance([], Array.from(this.availablePerformances));
  }

  public updatePerformance(
    variants: Variant[],
    removeVariants?: Variant[]
  ): void {
    this.latestRequest?.unsubscribe();

    if (removeVariants !== undefined) {
      removeVariants.forEach((v) => this.deletePerformance(v));
      this.calculationInProgress.clear();
    }

    // Add previously computed variants again to get updated merged values
    // performance values should be cached in backend
    const variantsCombined: Variant[] = Array.from(
      new Set([
        ...variants,
        ...this.variantsPerformance.keys(),
        ...this.calculationInProgress,
      ])
    );

    variantsCombined
      .filter((v) => !this.availablePerformances.has(v))
      .forEach((v) => this.calculationInProgress.add(v));

    this.latestRequest = this.backendService
      .getTreePerformance(
        variantsCombined.map((v) => v.bid),
        removeVariants?.map((v) => v.bid)
      )
      .subscribe(
        (performance) => {
          this.mergedPerformance = ProcessTree.fromObj(
            performance.merged_performance_tree
          );

          this.allValues.clear();
          this.setVariantsPerformance(
            variants,
            performance.variants_tree_performance
          );
          this.allValuesMean.clear();
          this.setMeanPerformanceMap(this.mergedPerformance);

          variants.forEach((v, i) => {
            this.fitness.set(v, performance.fitness_values[i]);
          });

          variants.forEach((v) => this.availablePerformances.add(v));
          this.newValues.next(true);

          this.processTreeService.currentDisplayedProcessTree =
            performance.merged_performance_tree;

          variants.forEach((v) => this.calculationInProgress.delete(v));

          if (variants.length === 0) {
            this.clear();
            return;
          } else {
            this.modelViewModeService.viewMode = ViewMode.PERFORMANCE;
          }

          if (variants.length == 1) this.setShownTreePerformance(variants[0]);
          else if (variantsCombined.length > 0)
            this.showMergedTreePerformance();
          else this.unselectPerformance();
        },
        (error) => {
          variants.forEach((v) => this.calculationInProgress.clear());
        }
      );
  }

  public unselectPerformance() {
    this.modelViewModeService.viewMode = ViewMode.STANDARD;
    this.activeTreePerformance = undefined;
  }

  public setVariantsPerformance(
    variants: Variant[],
    performanceTrees: ProcessTree[]
  ): void {
    for (let i = 0; i < variants.length; i++) {
      this.variantsPerformance.set(variants[i], performanceTrees[i]);
    }

    variants.forEach((variant, i) => {
      const tree = performanceTrees[i];
      this.collectPerformance(tree, variant, this.allValues);
    });
  }

  // Stores performance values for each tree node in the performances map under the given variantIdx
  collectPerformance(
    vp: ProcessTree,
    variant: Variant,
    performances: Map<number, Map<Variant, TreePerformance>>
  ): Map<number, Map<Variant, TreePerformance>> {
    if (!performances.has(vp.id)) {
      performances.set(vp.id, new Map<Variant, TreePerformance>());
    }
    performances.get(vp.id).set(variant, vp.performance);

    for (const child of vp.children) {
      this.collectPerformance(child, variant, performances);
    }
    return performances;
  }

  public setShownTreePerformance(variant: Variant): void {
    this.activeTreePerformance = variant.bid;
    if (this.variantsPerformance.has(variant)) {
      this.processTreeService.currentDisplayedProcessTree =
        this.variantsPerformance.get(variant);
      this.modelViewModeService.viewMode = ViewMode.PERFORMANCE;
    } else {
      console.error(`No performance values available: ${variant}`);
    }
  }

  public showMergedTreePerformance() {
    if (this.activeTreePerformance === -1) {
      this.unselectPerformance();
    } else {
      this.activeTreePerformance = -1;
      this.modelViewModeService.viewMode = ViewMode.PERFORMANCE;
      this.processTreeService.currentDisplayedProcessTree =
        this.mergedPerformance;
    }
  }

  public toggleMergedTreePerformance() {
    if (this.isMergedTreePerformanceActive()) this.unselectPerformance();
    else this.showMergedTreePerformance();
  }

  private clear(): void {
    this.mergedPerformance = undefined;
    this.variantsPerformance.clear();
    this.availablePerformances.clear();
    this.allValues.clear();
    this.allValuesMean.clear();
    this.activeTreePerformance = undefined;
    this.calculationInProgress.clear();
    this.processTreeService.selectedTree = undefined;

    this.modelViewModeService.viewMode = ViewMode.STANDARD;
  }

  private deletePerformance(variant: Variant) {
    if (this.activeTreePerformance == variant.bid) {
      this.activeTreePerformance = -1;
    }
    this.availablePerformances.delete(variant);
    this.variantsPerformance.delete(variant);
    this.allValues.forEach((v) => v.delete(variant));
  }

  private setMeanPerformanceMap(tree: ProcessTree): void {
    this.allValuesMean.set(tree.id, tree.performance);
    tree.children.forEach((node) => this.setMeanPerformanceMap(node));
  }

  public isTreePerformanceActive(v: Variant) {
    return (
      this.activeTreePerformance === v.bid &&
      this.modelViewModeService.viewMode === ViewMode.PERFORMANCE
    );
  }
  public isMergedTreePerformanceActive() {
    return (
      this.activeTreePerformance === -1 &&
      this.modelViewModeService.viewMode === ViewMode.PERFORMANCE
    );
  }

  public isTreePerformanceAvailable(v: Variant) {
    return this.availablePerformances.has(v);
  }

  public anyTreePerformanceAvailable() {
    return this.availablePerformances.size > 0;
  }

  public isTreePerformanceCalcInProgress(v: Variant) {
    return this.calculationInProgress.has(v);
  }

  public isTreePerformanceFitting(v: Variant) {
    const fitness = this.fitness.get(v);
    return fitness == undefined || fitness == 1;
  }
}
