import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastEvent } from 'src/app/objects/toast-event';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-toaster',
  templateUrl: './toaster.component.html',
  styleUrls: ['./toaster.component.css'],
})
export class ToasterComponent implements OnInit, OnDestroy {
  currentToasts: ToastEvent[] = [];

  private _destroy$ = new Subject();

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subscribeToToasts();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  subscribeToToasts() {
    this.toastService.toastEvents
      .pipe(takeUntil(this._destroy$))
      .subscribe((toast) => {
        this.currentToasts.push(toast);
      });
  }

  dispose(index: number) {
    this.currentToasts.splice(index, 1);
  }
}
