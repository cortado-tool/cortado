import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, Inject, Output } from '@angular/core';
import {
  distinctUntilChanged,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { fromEvent } from 'rxjs';

@Directive({
  selector: '[resizeable]', // eslint-disable-line @angular-eslint/directive-selector
})
export class ResizeColumnDirective {
  @Output()
  readonly resizeable = fromEvent<MouseEvent>(
    this.elementRef.nativeElement,
    'mousedown'
  ).pipe(
    tap((e) => e.preventDefault()),
    switchMap(() => {
      const { width, right } = this.elementRef.nativeElement
        .closest('th')!
        .getBoundingClientRect();

      return fromEvent<MouseEvent>(this.documentRef, 'mousemove').pipe(
        map(({ clientX }) => width + clientX - right),
        distinctUntilChanged(),
        takeUntil(fromEvent(this.documentRef, 'mouseup'))
      );
    })
  );

  constructor(
    @Inject(DOCUMENT) private readonly documentRef: Document,
    @Inject(ElementRef)
    private readonly elementRef: ElementRef<HTMLElement>
  ) {}
}
