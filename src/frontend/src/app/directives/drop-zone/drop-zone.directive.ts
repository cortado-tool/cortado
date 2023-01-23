import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appDropZone]',
})
export class DropZoneDirective {
  private static _windowDrag: boolean = false;
  constructor() {}

  static get windowDrag(): boolean {
    return DropZoneDirective._windowDrag;
  }

  static set windowDrag(state: boolean) {
    DropZoneDirective._windowDrag = state;
  }
}
