import { ProcessTreeService } from 'src/app/services/processTreeService/process-tree.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModelPerformanceColorScaleService } from '../../../services/performance-color-scale.service';
import { SharedDataService } from '../../../services/sharedDataService/shared-data.service';
import { PerformanceService } from '../../../services/performance.service';
import {
  buildColorValues,
  ColorMapValue,
} from '../color-map/color-map.component';
import { ProcessTree } from '../../../objects/ProcessTree/ProcessTree';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-tree-performance-color-map',
  templateUrl: './tree-performance-color-map.component.html',
  styleUrls: ['./tree-performance-color-map.component.scss'],
})
export class TreePerformanceColorMapComponent implements OnInit, OnDestroy {
  availableColorMaps = ModelPerformanceColorScaleService.COLOR_MAPS;
  availablePerformanceValues = ['mean', 'min', 'max', 'stdev'];
  availablePerformanceIndicators = [
    'service_time',
    'waiting_time',
    'cycle_time',
    'idle_time',
  ];
  modeHelpText = '';
  modeLongHelpText = '';

  selectedTree: ProcessTree;

  colorMapValues: ColorMapValue[];

  private _destroy$ = new Subject();

  constructor(
    public performanceColorScaleService: ModelPerformanceColorScaleService,
    private sharedDataService: SharedDataService,
    private processTreeService: ProcessTreeService,
    private performanceService: PerformanceService
  ) {}

  ngOnInit(): void {
    this.modeHelpText = ModelPerformanceColorScaleService.COLOR_MAPS.filter(
      (x) => x.key === this.performanceColorScaleService.selectedColorScale.mode
    )[0]?.description;
    this.modeLongHelpText = ModelPerformanceColorScaleService.COLOR_MAPS.filter(
      (x) => x.key === this.performanceColorScaleService.selectedColorScale.mode
    )[0]?.longDescription;
    this.performanceColorScaleService.currentColorScale
      .pipe(takeUntil(this._destroy$))
      .subscribe((colorScale) => {
        if (
          colorScale &&
          this.performanceService.anyTreePerformanceAvailable()
        ) {
          this.updateColorMapValues();
        }
      });
    this.processTreeService.selectedTree$
      .pipe(takeUntil(this._destroy$))
      .subscribe((t) => {
        if (
          t &&
          this.performanceColorScaleService.selectedColorScale.mode ===
            'compareVariants'
        ) {
          this.selectedTree = t;
          this.updateColorMapValues();
        }
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  colorScaleChange(e): void {
    const selected = this.availableColorMaps.find(
      (m) => m.key === this.performanceColorScaleService.selectedColorScale.mode
    );
    this.modeHelpText = selected.description;
    this.modeLongHelpText = selected.longDescription;
    this.performanceColorScaleService.updateCurrentColorScale();

    if (this.processTreeService.currentDisplayedProcessTree?.performance) {
      this.updateColorMapValues();
    }
  }

  updateColorMapValues(): ColorMapValue[] {
    if (this.performanceColorScaleService.getColorScale() === undefined) {
      return;
    }
    let colorScale;
    if (
      this.performanceColorScaleService.selectedColorScale.mode ===
      'compareNodes'
    ) {
      colorScale = this.performanceColorScaleService
        .getColorScale()
        .values()
        .next().value;
    } else {
      colorScale = this.performanceColorScaleService
        .getColorScale()
        .get(this.selectedTree.id);
    }
    let values = this.performanceColorScaleService.getAllAllValues();
    if (colorScale !== undefined) {
      this.colorMapValues = buildColorValues(colorScale, values);
    } else {
      this.colorMapValues = undefined;
    }
  }
}
