import { Component } from '@angular/core';
import { VariantPerformanceService } from 'src/app/services/variant-performance.service';

@Component({
  selector: 'app-performance-progress-bar',
  templateUrl: './performance-progress-bar.component.html',
  styleUrls: ['./performance-progress-bar.component.css'],
})
export class PerformanceProgressBarComponent {
  constructor(public variantPerformanceService: VariantPerformanceService) {}
}
