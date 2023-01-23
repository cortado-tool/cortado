import {
  Component,
  ChangeDetectionStrategy,
  Renderer2,
  Inject,
  ElementRef,
} from '@angular/core';
import { ComponentContainer, LogicalZIndex } from 'golden-layout';
import { LayoutChangeDirective } from 'src/app/directives/layout-change/layout-change.directive';

@Component({
  selector: 'app-golden-layout-dummy',
  templateUrl: './golden-layout-dummy.component.html',
  styleUrls: ['./golden-layout-dummy.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoldenLayoutDummyComponent extends LayoutChangeDirective {
  constructor(
    private renderer: Renderer2,
    @Inject(LayoutChangeDirective.GoldenLayoutContainerInjectionToken)
    private container: ComponentContainer,
    elRef: ElementRef
  ) {
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

export namespace GoldenLayoutDummyComponent {
  export const componentName = 'GoldenLayoutDummyComponent';
}
