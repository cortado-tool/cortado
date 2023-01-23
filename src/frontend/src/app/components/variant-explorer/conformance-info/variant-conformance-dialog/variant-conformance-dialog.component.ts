import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Variant } from 'src/app/objects/Variants/variant';
import { BackendService } from 'src/app/services/backendService/backend.service';
import { ConformanceCheckingService } from 'src/app/services/conformanceChecking/conformance-checking.service';

declare var $: any;

@Component({
  selector: 'app-variant-conformance-dialog',
  templateUrl: './variant-conformance-dialog.component.html',
  styleUrls: ['./variant-conformance-dialog.component.scss'],
})
export class VariantConformanceDialogComponent implements OnInit, OnDestroy {
  variant: Variant;
  conformanceTimeout: number = 30;
  callback;

  private _destroy$ = new Subject();

  constructor(
    private backendService: BackendService,
    private conformanceCheckingService: ConformanceCheckingService
  ) {}

  ngOnInit(): void {
    this.conformanceCheckingService.showConformanceCheckingTimeoutDialog
      .pipe(takeUntil(this._destroy$))
      .subscribe(([variant, callback]) => {
        this.callback = callback;
        this.variant = variant;
        this.backendService
          .getConfiguration()
          .pipe(takeUntil(this._destroy$))
          .subscribe((config) => {
            this.conformanceTimeout =
              config.timeoutCVariantAlignmentComputation + 30;
            $('#conformanceModalDialog').modal('show');
          });
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  hideModal(): void {
    document.getElementById('close-modal-conformance').click();
  }

  calculateConformance(): void {
    this.callback(this.variant, this.conformanceTimeout);
    this.hideModal();
  }
}
