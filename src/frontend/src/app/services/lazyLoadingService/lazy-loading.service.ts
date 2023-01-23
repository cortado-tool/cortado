import { ElementRef, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LazyLoadingServiceService {
  private intersectionObserver: any;

  private variantMinerMapping: Map<any, Function> = new Map<any, Function>();
  private variantMinerIntersectionObserver: IntersectionObserver;
  private mapping: Map<any, Function> = new Map<any, Function>();

  private initialize(rootElement: ElementRef): void {
    const self = this;
    this.intersectionObserver = new IntersectionObserver(
      function (entries) {
        for (let entry of entries) {
          const callback = self.mapping.get(entry.target);

          if (callback !== undefined) {
            callback(entry.isIntersecting);
          }
        }
      },
      {
        root: rootElement.nativeElement,
        rootMargin: '2000px 2000px 2000px 2000px',
      }
    );
  }

  public destoryVariantMinerObserver() {
    this.variantMinerIntersectionObserver = null;
  }

  private initializeVariantMiner(rootElement: ElementRef) {
    const self = this;
    this.variantMinerIntersectionObserver = new IntersectionObserver(
      function (entries) {
        for (let entry of entries) {
          const callback = self.variantMinerMapping.get(entry.target);

          if (callback !== undefined) {
            callback(entry.isIntersecting);
          }
        }
      },
      {
        root: rootElement.nativeElement,
        rootMargin: '2000px 2000px 2000px 2000px',
      }
    );
  }

  public addVariant(
    variantElement: any,
    rootElement: ElementRef,
    callback: Function
  ): void {
    if (
      this.intersectionObserver === null ||
      this.intersectionObserver === undefined
    ) {
      this.initialize(rootElement);
    }

    this.mapping.set(variantElement, callback);
    this.intersectionObserver.observe(variantElement);
  }

  public addSubPattern(
    variantElement: any,
    rootElement: ElementRef,
    callback: Function
  ): void {
    if (
      this.variantMinerIntersectionObserver === null ||
      this.variantMinerIntersectionObserver === undefined
    ) {
      this.initializeVariantMiner(rootElement);
    }

    this.variantMinerMapping.set(variantElement, callback);
    this.variantMinerIntersectionObserver.observe(variantElement);
  }
}
