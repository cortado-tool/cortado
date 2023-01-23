import { Component, Input } from '@angular/core';
import { PerformanceStats } from 'src/app/objects/Variants/variant_element';

@Component({
  selector: 'app-performance-table',
  templateUrl: './performance-table.component.html',
  styleUrls: ['./performance-table.component.scss'],
})
export class PerformanceTableComponent {
  @Input()
  performanceValues: PerformanceStats;

  @Input()
  heading: string;

  @Input()
  isBodyExpanded = false;
}
