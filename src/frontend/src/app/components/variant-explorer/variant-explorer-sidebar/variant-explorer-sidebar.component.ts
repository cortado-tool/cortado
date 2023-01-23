import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ViewMode } from 'src/app/objects/ViewMode';
import { VariantPerformanceService } from 'src/app/services/variant-performance.service';
import { VariantService } from 'src/app/services/variantService/variant.service';
import { VariantViewModeService } from 'src/app/services/viewModeServices/variant-view-mode.service';

@Component({
  selector: 'app-variant-explorer-sidebar',
  templateUrl: './variant-explorer-sidebar.component.html',
  styleUrls: ['./variant-explorer-sidebar.component.css'],
})
export class VariantExplorerSidebarComponent implements OnInit, OnDestroy {
  @Input()
  public sidebarHeight: number = 0;

  public VM = ViewMode;

  private _destroy$ = new Subject();

  constructor(
    public variantViewModeService: VariantViewModeService,
    private variantPerformanceService: VariantPerformanceService,
    public variantService: VariantService
  ) {}

  ngOnInit(): void {
    return;
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  public setViewModeClicked(viewMode: ViewMode) {
    if (
      viewMode === ViewMode.PERFORMANCE &&
      !this.variantPerformanceService.performanceInformationLoaded
    )
      this.variantPerformanceService
        .addPerformanceInformationToVariants()
        .pipe(takeUntil(this._destroy$))
        .subscribe();
    else this.variantViewModeService.viewMode = viewMode;
  }
}
