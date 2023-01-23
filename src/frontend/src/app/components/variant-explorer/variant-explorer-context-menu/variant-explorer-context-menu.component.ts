import {
  AfterViewInit,
  Component,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { VariantDrawerDirective } from 'src/app/directives/variant-drawer/variant-drawer.directive';
import { VariantElement } from 'src/app/objects/Variants/variant_element';

@Component({
  selector: 'app-variant-explorer-context-menu',
  templateUrl: './variant-explorer-context-menu.component.html',
  styleUrls: ['./variant-explorer-context-menu.component.css'],
})
export class VariantExplorerContextMenuComponent
  implements OnChanges, AfterViewInit
{
  @Input()
  xPos: number;

  @Input()
  yPos: number;

  displayMenu: boolean = false;

  @Input()
  contextMenuOptions: Array<ContextMenuItem>;

  constructor() {}

  ngAfterViewInit(): void {
    this.displayMenu = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!(changes.xPos.isFirstChange() && changes.yPos.isFirstChange())) {
      this.displayMenu = true;
    }
  }

  @HostListener('window:click', ['$event'])
  public onClick(event: any): void {
    this.displayMenu = false;
  }
}

export class ContextMenuItem {
  constructor(
    text: string,
    icon: string,
    onClick: (
      variant: VariantElement,
      element: VariantElement,
      directive: VariantDrawerDirective
    ) => {}
  ) {
    this.icon = icon;
    this.text = text;
    this.onClick = onClick;
  }

  onClick: (
    variant: VariantElement,
    element: VariantElement,
    directive: VariantDrawerDirective
  ) => {};

  icon: string;
  text: string;
}
