import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ProcessTree } from 'src/app/objects/ProcessTree/ProcessTree';
import { Variant } from 'src/app/objects/Variants/variant';
import { ConformanceCheckingService } from 'src/app/services/conformanceChecking/conformance-checking.service';
import { textColorForBackgroundColor } from 'src/app/utils/render-utils';

@Component({
  selector: 'app-tree-conformance-button',
  templateUrl: './tree-conformance-button.component.html',
  styleUrls: ['./tree-conformance-button.component.css'],
})
export class TreeConformanceButtonComponent {
  @Input()
  variant: Variant;

  @Output()
  public showConformance = new EventEmitter<Variant>();

  @Output()
  public removeConformance = new EventEmitter<Variant>();

  constructor(public conformanceCheckingService: ConformanceCheckingService) {}

  removeCurrentConformance() {
    this.removeConformance.emit(this.variant);
  }
  showSelectedConformance() {
    this.showConformance.emit(this.variant);
  }

  computeConformanceButtonColor() {
    return this.conformanceCheckingService.conformanceColorMap.getColor(
      this.conformanceValue
    );
  }

  computeConformanceButtonTextColor() {
    const buttonColor = this.computeConformanceButtonColor();
    if (!buttonColor) return 'white';
    return textColorForBackgroundColor(buttonColor);
  }

  get conformanceValue() {
    let tree: ProcessTree;
    if (this.variant)
      tree = this.conformanceCheckingService.variantsConformance.get(
        this.variant
      );
    else tree = this.conformanceCheckingService.mergedTreeConformance;

    if (!tree) return null;

    return this.conformanceCheckingService.isConformanceWeighted &&
      tree.conformance.weighted_by_counts != undefined
      ? tree.conformance.weighted_by_counts.value
      : tree.conformance.weighted_equally.value;
  }

  get isConformanceActive() {
    if (this.variant === undefined)
      return this.conformanceCheckingService.isMergedTreeConformanceActive();
    return this.conformanceCheckingService.isTreeConformanceActive(
      this.variant
    );
  }

  get isConformanceAvailable() {
    if (this.variant === undefined)
      return this.conformanceCheckingService.isMergedTreeConformanceAvailable();
    return this.conformanceCheckingService.isTreeConformanceAvailable(
      this.variant
    );
  }

  get isConformanceCalcInProgress() {
    if (this.variant === undefined) return false;
    return this.conformanceCheckingService.isTreeConformanceCalcInProgress(
      this.variant
    );
  }

  get deleteButtonTooltip() {
    if (this.variant) return 'remove conformance values of this variant';
    else return 'remove conformance values of all variants';
  }
}
