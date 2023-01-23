import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Renderer2,
} from '@angular/core';
import { LogicalZIndex } from 'golden-layout';
import { LayoutChangeDirective } from 'src/app/directives/layout-change/layout-change.directive';

@Component({
  selector: 'app-info-box',
  templateUrl: './info-box.component.html',
  styleUrls: ['./info-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoBoxComponent extends LayoutChangeDirective {
  constructor(renderer: Renderer2, elRef: ElementRef) {
    super(elRef.nativeElement, renderer);
  }

  handleResponsiveChange(
    left: number,
    top: number,
    width: number,
    height: number
  ): void {}

  handleVisibilityChange(visibility: boolean): void {}

  handleZIndexChange(
    logicalZIndex: LogicalZIndex,
    defaultZIndex: string
  ): void {}
}

export namespace InfoBoxComponent {
  export const componentName = 'InfoBoxComponent';
}
