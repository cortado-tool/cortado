import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { flyInComponent } from 'src/app/animations/component-animations';

@Component({
  selector: 'app-variant-query-info',
  templateUrl: './variant-query-info.component.html',
  styleUrls: ['./variant-query-info.component.scss'],
  animations: [flyInComponent],
})
export class VariantQueryInfoComponent {
  constructor() {}

  @Input() showInfo: boolean;
  @Output() showInfoChange = new EventEmitter<boolean>();

  public requestClose() {
    this.showInfo = false;
    this.showInfoChange.emit(false);
  }
}
