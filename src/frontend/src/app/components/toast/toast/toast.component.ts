import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastEvent, ToastType } from 'src/app/objects/toast-event';
declare var bootstrap: any;

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
})
export class ToastComponent implements OnInit, OnDestroy {
  @Output() disposeEvent = new EventEmitter();

  @ViewChild('toastElement', { static: true })
  toastEl!: ElementRef;

  @Input()
  toastEvent: ToastEvent;

  toast: any;

  type: string;

  ToastType = ToastType;

  private _destroy$ = new Subject();

  ngOnInit() {
    this.setTypeString();
    this.show();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  setTypeString(): void {
    switch (this.toastEvent.type) {
      case ToastType.SUCCESS:
        this.type = 'Info';
        break;
      case ToastType.WARNING:
        this.type = 'Warning';
        break;
      case ToastType.ERROR:
        this.type = 'Error';
        break;
      default:
        this.type = '';
        break;
    }
  }

  show() {
    this.toast = new bootstrap.Toast(this.toastEl.nativeElement, {
      autohide: this.toastEvent.autoclose,
      delay: this.toastEvent.delay,
    });
    fromEvent(this.toastEl.nativeElement, 'hidden.bs.toast')
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => this.hide());
    this.toast.show();
  }

  hide() {
    this.toast.dispose();
    this.disposeEvent.emit();
  }
}
