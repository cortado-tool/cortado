import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'th[resizeable]', // eslint-disable-line @angular-eslint/component-selector
  templateUrl: './resizeable-table-header.component.html',
  styleUrls: ['./resizeable-table-header.component.scss'],
})

// https://stackblitz.com/edit/angular-resizable-columns
export class ResizeableTableHeaderComponent {
  constructor() {}
  @HostBinding('style.width.px')
  width: number | null = null;

  @Input()
  margin: number;

  onResize(width: any) {
    this.width = width;
  }
}
