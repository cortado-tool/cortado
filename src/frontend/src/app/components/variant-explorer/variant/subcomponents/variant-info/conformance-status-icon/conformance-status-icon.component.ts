import { Component, Input, OnInit } from '@angular/core';
import { Variant } from 'src/app/objects/Variants/variant';

@Component({
  selector: 'app-conformance-status-icon',
  templateUrl: './conformance-status-icon.component.html',
  styleUrls: ['./conformance-status-icon.component.css'],
})
export class ConformanceStatusIconComponent {
  @Input()
  variant: Variant;
  constructor() {}
}
