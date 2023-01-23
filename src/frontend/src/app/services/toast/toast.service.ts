import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ToastEvent, ToastType } from 'src/app/objects/toast-event';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toastEvents: Observable<ToastEvent>;
  private _toastEvents = new Subject<ToastEvent>();
  defaultDelay = 5000;
  defaultAutoclose = true;

  constructor() {
    this.toastEvents = this._toastEvents.asObservable();
  }

  showSuccessToast(title: string, body: string, icon: string) {
    this.showToastWithOptions(
      title,
      body,
      this.defaultDelay,
      this.defaultAutoclose,
      icon,
      ToastType.SUCCESS
    );
  }

  showWarningToast(title: string, body: string, icon: string) {
    this.showToastWithOptions(
      title,
      body,
      this.defaultDelay,
      this.defaultAutoclose,
      icon,
      ToastType.WARNING
    );
  }

  showErrorToast(title: string, body: string, icon: string) {
    this.showToastWithOptions(
      title,
      body,
      this.defaultDelay,
      this.defaultAutoclose,
      icon,
      ToastType.ERROR
    );
  }

  showToastWithOptions(
    title: string,
    body: string,
    delay: number,
    autoclose: boolean,
    icon: string,
    type: ToastType
  ) {
    this._toastEvents.next({
      title,
      body,
      delay,
      autoclose,
      icon,
      type,
    });
  }
}
