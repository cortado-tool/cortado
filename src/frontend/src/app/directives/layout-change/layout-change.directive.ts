import { Directive, InjectionToken, Renderer2 } from '@angular/core';
import { ComponentContainer, LogicalZIndex } from 'golden-layout';

@Directive()
export abstract class LayoutChangeDirective {
  constructor(
    public rootHtmlElement: HTMLElement,
    private renderer2: Renderer2
  ) {}

  setPositionAndSize(left: number, top: number, width: number, height: number) {
    this.renderer2.setStyle(
      this.rootHtmlElement,
      'left',
      this.numberToPixels(left)
    );
    this.renderer2.setStyle(
      this.rootHtmlElement,
      'top',
      this.numberToPixels(top)
    );
    this.renderer2.setStyle(
      this.rootHtmlElement,
      'width',
      this.numberToPixels(width)
    );
    this.renderer2.setStyle(
      this.rootHtmlElement,
      'height',
      this.numberToPixels(height)
    );
  }

  setVisibility(visible: boolean) {
    if (visible) {
      this.renderer2.setStyle(this.rootHtmlElement, 'display', '');
    } else {
      this.renderer2.setStyle(this.rootHtmlElement, 'display', 'none');
    }
  }

  setZIndex(value: string) {
    this.renderer2.setStyle(this.rootHtmlElement, 'zIndex', value);
  }

  private numberToPixels(value: number): string {
    return value.toString(10) + 'px';
  }

  // Abstract method that gets called after each virtual recting event to allow the component to change its layout
  abstract handleResponsiveChange(
    left: number,
    top: number,
    width: number,
    height: number
  ): void;

  abstract handleVisibilityChange(visibility: boolean): void;

  abstract handleZIndexChange(
    logicalZIndex: LogicalZIndex,
    defaultZIndex: string
  ): void;
}

export namespace LayoutChangeDirective {
  const GoldenLayoutContainerTokenName = 'GoldenLayoutContainer';
  export const GoldenLayoutContainerInjectionToken =
    new InjectionToken<ComponentContainer>(GoldenLayoutContainerTokenName);
}
