import { ProcessTreeService } from 'src/app/services/processTreeService/process-tree.service';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ElementRef,
  Inject,
  Renderer2,
  OnDestroy,
} from '@angular/core';

import {
  HumanizeDuration,
  HumanizeDurationLanguage,
} from 'humanize-duration-ts';
import {
  ProcessTree,
  TreePerformance,
} from 'src/app/objects/ProcessTree/ProcessTree';
import { ModelPerformanceColorScaleService } from 'src/app/services/performance-color-scale.service';
import { PerformanceService } from 'src/app/services/performance.service';
import { PerformanceStats } from 'src/app/objects/Variants/variant_element';
import { LayoutChangeDirective } from 'src/app/directives/layout-change/layout-change.directive';
import { ComponentContainer, LogicalZIndex } from 'golden-layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ModelViewModeService } from 'src/app/services/viewModeServices/model-view-mode.service';
import { ViewMode } from 'src/app/objects/ViewMode';
@Component({
  selector: 'app-performance',
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.scss'],
})
export class ModelPerformanceComponent
  extends LayoutChangeDirective
  implements OnInit, OnDestroy
{
  duration: HumanizeDuration;

  colorValues = [];

  performanceValues = [];

  treeSelection: string = undefined;
  selectionPerformances: [string, PerformanceStats][] = undefined;

  private _destroy$ = new Subject();

  public VM = ViewMode;

  constructor(
    public performanceService: PerformanceService,
    public processTreeService: ProcessTreeService,
    public performanceColorScaleService: ModelPerformanceColorScaleService,
    public modelViewModeService: ModelViewModeService,
    private changeDetectionRef: ChangeDetectorRef,
    renderer: Renderer2,
    @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken)
    private container: ComponentContainer,
    elRef: ElementRef
  ) {
    super(elRef.nativeElement, renderer);
    const durationLang = new HumanizeDurationLanguage();
    this.duration = new HumanizeDuration(durationLang);
  }

  ngOnInit(): void {
    this.processTreeService.currentDisplayedProcessTree$
      .pipe(takeUntil(this._destroy$))
      .subscribe((tree) => {
        this.performanceValues = [];
        if (tree && tree.performance) {
          this.nodePerformance(tree);
          this.changeDetectionRef.markForCheck();
        } else if (tree === undefined) {
          this.selectionPerformances = [];
          this.treeSelection = undefined;
          this.changeDetectionRef.markForCheck();
          return;
        }
      });

    this.processTreeService.selectedTree$
      .pipe(takeUntil(this._destroy$))
      .subscribe((tree) => {
        if (
          tree === undefined ||
          !this.performanceService.anyTreePerformanceAvailable()
        ) {
          this.selectionPerformances = [];
          this.treeSelection = undefined;
          this.changeDetectionRef.markForCheck();
          return;
        }

        this.selectionPerformances = [];
        this.treeSelection = tree?.toString();

        if (tree && this.performanceService.allValuesMean.has(tree.id)) {
          if (this.performanceService.allValuesMean.get(tree.id).service_time) {
            this.selectionPerformances.push([
              'Mean',
              this.performanceService.allValuesMean.get(tree.id).service_time,
            ]);
          }
          Array.from(this.performanceService.allValues.get(tree.id).entries())
            .map(([v, p]) => <[number, TreePerformance]>[v.bid, p])
            .filter(([v, p]) => p.service_time)
            .sort((a, b) => (a[0] = b[0]))
            .forEach(([v, p]) => {
              if (p.service_time) {
                this.selectionPerformances.push([
                  `Variant No. ${v}`,
                  p.service_time,
                ]);
              }
            });
        }
        this.changeDetectionRef.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  private nodePerformance(treeNode: ProcessTree): void {
    if (treeNode.performance) {
      this.performanceValues.push([treeNode.toString(), treeNode.performance]);
      treeNode.children.forEach((n) => this.nodePerformance(n));
    }
  }

  handleResponsiveChange(
    left: number,
    top: number,
    width: number,
    height: number
  ): void {}

  handleVisibilityChange(visibility: boolean): void {}

  handleZIndexChange(
    logicalZIndex: LogicalZIndex,
    defaultZIndex: string
  ): void {}
}

export namespace ModelPerformanceComponent {
  export const componentName = 'ModelPerformanceComponent';
}
