import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { ContextMenuComponent } from '@perfectmemory/ngx-contextmenu';
import { ContextMenuAction } from 'src/app/objects/ContextMenuAction';
import { Variant } from 'src/app/objects/Variants/variant';
import { VariantElement } from 'src/app/objects/Variants/variant_element';

@Component({
  selector: 'app-variant-query-modeler-context-menu',
  templateUrl: './variant-query-modeler-context-menu.component.html',
  styleUrls: ['./variant-query-modeler-context-menu.component.css'],
})
export class VariantQueryModelerContextMenuComponent {
  @ViewChild('contextMenu', { static: true })
  public contextMenu?: ContextMenuComponent<any>;

  @Output()
  public menuAction: EventEmitter<{ action: string; value: any }> =
    new EventEmitter();

  constructor() {}

  deleteDisabled(element: VariantElement) {
    return !element;
  }

  onDelete(action: ContextMenuAction<VariantElement>) {
    if (!action.value) return;
    // emit a delete action to the parent VariantQueryModelerComponent which performs
    // the actual model mutation (keeps this component UI-only)
    this.menuAction.emit({ action: 'delete', value: action.value });
  }

  onMakeOptional(action: ContextMenuAction<VariantElement>) {
    if (!action.value) return;
    // make optional
    this.menuAction.emit({ action: 'optional', value: action.value });
  }

  onMakeRepeatable(action: ContextMenuAction<VariantElement>) {
    if (!action.value) return;
    // make repeatable
    this.menuAction.emit({ action: 'repeatable', value: action.value });
  }

  onMakeChoice(action: ContextMenuAction<VariantElement>) {
    if (!action.value) return;
    // make choice
    this.menuAction.emit({ action: 'choice', value: action.value });
  }

  onAddWildcard(action: ContextMenuAction<Variant>) {
    if (!action.value) return;
    // add wildcard
    this.menuAction.emit({ action: 'wildcard', value: action.value });
  }

  onAddAnythingOperator(action: ContextMenuAction<Variant>) {
    if (!action.value) return;
    // add anything operator
    this.menuAction.emit({ action: 'anything', value: action.value });
  }

  onAddStartOperator(action: ContextMenuAction<Variant>) {
    if (!action.value) return;
    // add start operator
    this.menuAction.emit({ action: 'start', value: action.value });
  }

  onAddEndOperator(action: ContextMenuAction<Variant>) {
    if (!action.value) return;
    // add end operator
    this.menuAction.emit({ action: 'end', value: action.value });
  }

  onMakeFallthrough(action: ContextMenuAction<Variant>) {
    if (!action.value) return;
    // make fallthrough
    this.menuAction.emit({ action: 'fallthrough', value: action.value });
  }

  makeFallthroughDisabled(variant: Variant) {
    return !variant;
  }

  makeStartOperatorDisabled(variant: Variant) {
    return !variant;
  }

  makeEndOperatorDisabled(variant: Variant) {
    return !variant;
  }

  makeAnythingOperatorDisabled(variant: Variant) {
    return !variant;
  }

  makeWildcardDisabled(variant: Variant) {
    return !variant;
  }

  makeChoiceDisabled = (element: VariantElement) => {
    return !element;
  };

  makeOptionalDisabled(element: VariantElement) {
    return !element;
  }

  makeRepeatableDisabled(element: VariantElement) {
    return !element;
  }
}
