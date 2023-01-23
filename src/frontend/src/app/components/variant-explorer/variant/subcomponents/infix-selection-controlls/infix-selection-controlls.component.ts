import { VariantDrawerDirective } from 'src/app/directives/variant-drawer/variant-drawer.directive';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Variant } from 'src/app/objects/Variants/variant';

@Component({
  selector: 'app-infix-selection-controlls',
  templateUrl: './infix-selection-controlls.component.html',
  styleUrls: ['./infix-selection-controlls.component.css'],
})
export class InfixSelectionControllsComponent {
  constructor() {}

  @Input()
  variant: Variant;

  @Input()
  variantDrawer: VariantDrawerDirective;

  @Output()
  public selectTraceInfix = new EventEmitter<Variant>();

  addCurrentSelectedInfix(): void {
    this.selectTraceInfix.emit(this.variant);
    this.variantDrawer.redraw();
  }

  resetSelectionStatus(): void {
    this.variant.variant.resetSelectionStatus();
    this.variantDrawer.redraw();
  }

  selectAll(): void {
    this.variant.variant.setAllChildrenSelected();
    this.variant.variant.updateSelectionAttributes();
    this.variantDrawer.redraw();
  }
}
