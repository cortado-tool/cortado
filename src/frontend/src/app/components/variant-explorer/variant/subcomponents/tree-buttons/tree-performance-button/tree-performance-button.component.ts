import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Variant } from 'src/app/objects/Variants/variant';
import { HumanizeDurationPipe } from 'src/app/pipes/humanize-duration.pipe';
import { ModelPerformanceColorScaleService } from 'src/app/services/performance-color-scale.service';
import { PerformanceService } from 'src/app/services/performance.service';
import { textColorForBackgroundColor } from 'src/app/utils/render-utils';

@Component({
  selector: 'app-tree-performance-button',
  templateUrl: './tree-performance-button.component.html',
  styleUrls: ['./tree-performance-button.component.css'],
})
export class TreePerformanceButtonComponent {
  constructor(
    private performanceService: PerformanceService,
    private modelPerformanceColorScaleService: ModelPerformanceColorScaleService
  ) {}

  @Input()
  variant: Variant;

  @Output()
  public showPerformance = new EventEmitter<Variant>();

  @Output()
  public removePerformance = new EventEmitter<Variant>();

  @Input()
  computePerformanceButtonColor: (variant: Variant) => string;

  get isPerformanceActive() {
    return this.performanceService.isTreePerformanceActive(this.variant);
  }

  get isPerformanceAvailable() {
    return this.performanceService.isTreePerformanceAvailable(this.variant);
  }

  get isPerformanceCalcInProgress() {
    return this.performanceService.isTreePerformanceCalcInProgress(
      this.variant
    );
  }

  get isPerformanceFitting() {
    return this.performanceService.isTreePerformanceFitting(this.variant);
  }

  removeCurrentPerformance() {
    this.removePerformance.emit(this.variant);
  }
  showSelectedPerformance() {
    this.showPerformance.emit(this.variant);
  }

  textColorForBackgroundColor(variant: Variant): string {
    if (this.computePerformanceButtonColor(variant) === null) {
      return 'white';
    }
    return textColorForBackgroundColor(
      this.computePerformanceButtonColor(variant)
    );
  }

  get variantFitness(): string {
    return this.performanceService.fitness.get(this.variant)?.toFixed(2);
  }

  get tooltipText(): string {
    const selectedColorScale =
      this.modelPerformanceColorScaleService.selectedColorScale;
    let performance = this.performanceService.variantsPerformance.get(
      this.variant
    ).performance[selectedColorScale.performanceIndicator]?.[
      selectedColorScale.statistic
    ];
    if (performance == undefined) {
      performance = 0;
    }
    const humanizedPerf = HumanizeDurationPipe.apply(performance * 1000, {
      round: true,
    });
    return `${selectedColorScale.performanceIndicator} (${selectedColorScale.statistic}): ${humanizedPerf}`;
  }
}
