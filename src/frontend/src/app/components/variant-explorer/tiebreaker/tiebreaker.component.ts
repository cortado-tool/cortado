import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BackendService } from 'src/app/services/backendService/backend.service';
import { VariantService } from 'src/app/services/variantService/variant.service';
declare var $;

@Component({
  selector: 'app-tiebreaker',
  templateUrl: './tiebreaker.component.html',
  styleUrls: ['./tiebreaker.component.css'],
})
export class TiebreakerComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject();

  constructor(
    private variantService: VariantService,
    private backendService: BackendService
  ) {}

  ngOnInit(): void {
    this.variantService.showTiebreakerDialog
      .pipe(takeUntil(this._destroy$))
      .subscribe((_) => {
        this.showModal();
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  showModal(): void {
    $('#tiebreakerModalDialog').modal('show');
  }

  hideModal(): void {
    $('#tiebreakerModalDialog').modal('hide');
  }

  apply(sourcePattern, targetPattern): void {
    this.hideModal();
    this.backendService.applyTiebreaker(sourcePattern, targetPattern);
  }
}
