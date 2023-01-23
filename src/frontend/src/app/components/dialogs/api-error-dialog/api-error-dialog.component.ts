import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SwalPortalTargets } from '@sweetalert2/ngx-sweetalert2';
import { NextObserver, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { expandCollapsed } from 'src/app/animations/text-animations';
import { ApiError } from 'src/app/objects/ApiError';
import { ErrorService } from 'src/app/services/errorService/error.service';

@Component({
  selector: 'app-api-error-dialog',
  templateUrl: './api-error-dialog.component.html',
  styleUrls: ['./api-error-dialog.component.scss'],
  animations: [expandCollapsed],
})
export class ApiErrorDialogComponent implements OnInit, OnDestroy {
  public isVisible: boolean;
  public apiError: ApiError;
  public message: string;
  public isStackTraceExpanded: boolean = false;

  private _destroy$ = new Subject();

  constructor(
    private errorService: ErrorService,
    public readonly swalTargets: SwalPortalTargets
  ) {}

  ngOnInit(): void {
    this.errorService
      .getErrors()
      .pipe(takeUntil(this._destroy$))
      .subscribe(this.updatePropsObserver());
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  toggleStackTrace() {
    this.isStackTraceExpanded = !this.isStackTraceExpanded;
  }

  updatePropsObserver(): NextObserver<HttpErrorResponse> {
    return {
      next: (errorRes: HttpErrorResponse) => {
        // initial value if errorRes is {}
        this.isVisible = Object.keys(errorRes).length != 0;
        this.apiError = errorRes.error;
        this.message = errorRes.message;

        if (errorRes.error && errorRes.error.detail) {
          this.message += '\n' + errorRes.error.detail;
        }

        if (errorRes.status === 0) {
          this.message =
            'The backend is unavailable. Wait for the backend to start or start it manually.';
        }
      },
    };
  }

  onCopySuccess() {}

  onClose() {
    this.isVisible = false;
  }
}
