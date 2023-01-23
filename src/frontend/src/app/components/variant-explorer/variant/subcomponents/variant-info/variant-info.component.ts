import { ProcessTreeService } from 'src/app/services/processTreeService/process-tree.service';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Variant } from 'src/app/objects/Variants/variant';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InfixType } from 'src/app/objects/Variants/infix_selection';

@Component({
  selector: 'app-variant-info',
  templateUrl: './variant-info.component.html',
  styleUrls: ['./variant-info.component.css'],
})
export class VariantInfoComponent implements OnInit, OnDestroy {
  @Input()
  variant: Variant;

  @Input()
  selectable: boolean = true;

  @Output()
  public selectionChanged = new EventEmitter<boolean>();

  @Output()
  public updateConformance = new EventEmitter<Variant>();

  public processTreeIsPresent: boolean = false;

  private _destroy$ = new Subject();

  variantOccurrences: number;
  traceOccurrences: number;
  totalVariantOccurrences: number;
  totalTraceOccurrences: number;
  traceOccurrencesFraction: number;
  variantOccurrencesFraction: number;

  constructor(private processTreeService: ProcessTreeService) {}

  ngOnInit(): void {
    this.processTreeService.currentDisplayedProcessTree$
      .pipe(takeUntil(this._destroy$))
      .subscribe((t) => {
        this.processTreeIsPresent = t !== undefined && t !== null;
      });

    if (this.variant.infixType != InfixType.NOT_AN_INFIX) {
      let fragmentStatistics: any = this.variant.fragmentStatistics;

      this.variantOccurrences = fragmentStatistics.variantOccurrences;
      this.traceOccurrences = fragmentStatistics.traceOccurrences;
      this.totalVariantOccurrences = fragmentStatistics.totalOccurrences;
      this.totalTraceOccurrences = fragmentStatistics.totalTraceOccurrences;
      this.variantOccurrencesFraction =
        fragmentStatistics.variantOccurrencesFraction;
      this.traceOccurrencesFraction =
        fragmentStatistics.traceOccurrencesFraction;
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  conformanceIconClicked(): void {
    if (this.isConformanceUpdatePossible()) {
      this.updateConformance.emit(this.variant);
    }
  }

  isConformanceUpdatePossible(): boolean {
    return (
      !this.variant.calculationInProgress &&
      (this.variant.isConformanceOutdated ||
        this.variant.isTimeouted ||
        this.variant.deviations === undefined)
    );
  }
}
