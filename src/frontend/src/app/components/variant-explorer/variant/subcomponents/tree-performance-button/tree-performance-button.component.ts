import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Variant } from 'src/app/objects/Variants/variant';
import { textColorForBackgroundColor } from 'src/app/utils/render-utils';

@Component({
  selector: 'app-tree-performance-button',
  templateUrl: './tree-performance-button.component.html',
  styleUrls: ['./tree-performance-button.component.css'],
})
export class TreePerformanceButtonComponent {
  constructor() {}

  @Input()
  variant: Variant;

  @Input()
  isPerformanceAvailable: (variant: Variant) => boolean;

  @Input()
  isPerformanceActive: (variant: Variant) => boolean;

  @Input()
  isPerformanceFitting: (variant: Variant) => boolean;

  @Input()
  isPerformanceCalcInProgress: (variant: Variant) => boolean;

  @Output()
  public showPerformance = new EventEmitter<Variant>();

  @Output()
  public removePerformance = new EventEmitter<Variant>();

  @Input()
  computePerformanceButtonColor: (variant: Variant) => string;

  removeCurrentPerformance() {
    this.removePerformance.emit(this.variant);
  }
  showSelectedPerformance() {
    this.showPerformance.emit(this.variant);
  }

  textColorForBackgroundColor(variant: Variant): string {
    if (this.computePerformanceButtonColor(variant) === null) {
      return 'white';
    }
    return textColorForBackgroundColor(
      this.computePerformanceButtonColor(variant)
    );
  }
}
