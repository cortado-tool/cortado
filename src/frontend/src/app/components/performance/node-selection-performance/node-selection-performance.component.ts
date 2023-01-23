import { VariantService } from './../../../services/variantService/variant.service';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import {
  HumanizeDuration,
  HumanizeDurationLanguage,
} from 'humanize-duration-ts';
import { ModelPerformanceColorScaleService } from 'src/app/services/performance-color-scale.service';
import { PerformanceService } from 'src/app/services/performance.service';
import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
import { TreePerformance } from '../../../objects/ProcessTree/ProcessTree';
import { Variant } from 'src/app/objects/Variants/variant';
import { PerformanceStats } from 'src/app/objects/Variants/variant_element';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProcessTreeService } from 'src/app/services/processTreeService/process-tree.service';

@Component({
  selector: 'app-node-selection-performance',
  templateUrl: './node-selection-performance.component.html',
  styleUrls: ['./node-selection-performance.component.scss'],
})
export class NodeSelectionPerformanceComponent implements OnInit, OnDestroy {
  treeSelection: string = undefined;
  humanizeDuration: HumanizeDuration;

  meanValues: TreePerformance;
  serviceTimeValues: Map<Variant, PerformanceStats> = new Map();
  waitingTimeValues: Map<Variant, PerformanceStats> = new Map();
  idleTimeValues: Map<Variant, PerformanceStats> = new Map();
  cycleTimeValues: Map<Variant, PerformanceStats> = new Map();

  public variants: Variant[];

  public variantIndices = new Map<Variant, number>();

  private _destroy$ = new Subject();

  constructor(
    private processTreeService: ProcessTreeService,
    public performanceService: PerformanceService,
    public performanceColorScaleService: ModelPerformanceColorScaleService,
    public sharedDataService: SharedDataService,
    private variantService: VariantService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    const durationLang = new HumanizeDurationLanguage();
    this.humanizeDuration = new HumanizeDuration(durationLang);
  }

  ngOnInit(): void {
    this.processTreeService.selectedTree$
      .pipe(takeUntil(this._destroy$))
      .subscribe((tree) => {
        if (
          tree === undefined ||
          !this.performanceService.anyTreePerformanceAvailable()
        ) {
          this.treeSelection = undefined;
          this.meanValues = undefined;
          return;
        }
        this.treeSelection = tree?.toString();
        const meanValues = this.performanceService.allValuesMean.get(tree?.id);
        if (tree && meanValues) {
          this.meanValues = this.performanceService.allValuesMean.get(tree.id);

          const availableVariants = Array.from(
            this.performanceService.allValues.get(tree.id).entries()
          ).filter(
            ([v, perf]) =>
              perf.service_time ||
              perf.waiting_time ||
              perf.idle_time ||
              perf.cycle_time
          );

          availableVariants.sort((a, b) => a[0].bid - b[0].bid);
          this.variants = availableVariants.map((v) => v[0]);
          availableVariants
            .map(
              ([v, p]) =>
                <[number, TreePerformance]>[
                  this.variantService.variants.indexOf(v),
                  p,
                ]
            )
            .forEach(([vIdx, p]) => {
              const v = this.variantService.variants[vIdx];
              this.variantIndices.set(v, vIdx + 1);
              this.serviceTimeValues.set(
                v,
                this.performanceService.allValues.get(tree.id).get(v)
                  .service_time
              );
              this.waitingTimeValues.set(
                v,
                this.performanceService.allValues.get(tree.id).get(v)
                  .waiting_time
              );
              this.cycleTimeValues.set(
                v,
                this.performanceService.allValues.get(tree.id).get(v).cycle_time
              );
              this.idleTimeValues.set(
                v,
                this.performanceService.allValues.get(tree.id).get(v).idle_time
              );
            });
        }

        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }
}

export class PerformanceValues {
  variantName: string | undefined;
  performance: PerformanceStats;
}
