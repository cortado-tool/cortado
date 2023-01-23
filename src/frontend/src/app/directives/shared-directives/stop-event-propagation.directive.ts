import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appStopClickEventPropagation]',
})
export class StopEventPropagationDirective {
  @HostListener('click', ['$event'])
  public onClick(event: any): void {
    event.stopPropagation();
  }
}
