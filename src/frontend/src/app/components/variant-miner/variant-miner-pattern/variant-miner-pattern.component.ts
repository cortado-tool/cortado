import { LazyLoadingServiceService } from 'src/app/services/lazyLoadingService/lazy-loading.service';
import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { VariantDrawerDirective } from 'src/app/directives/variant-drawer/variant-drawer.directive';
import { InfixType } from 'src/app/objects/Variants/infix_selection';
import { SubvariantPattern } from 'src/app/objects/Variants/variant-miner-types';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-variant-miner-pattern]',
  templateUrl: './variant-miner-pattern.component.html',
  styleUrls: ['./variant-miner-pattern.component.css'],
})
export class VariantMinerPatternComponent implements AfterViewInit {
  @Input()
  pattern: SubvariantPattern;
  infixtype = InfixType;

  @Input()
  id: number;

  @ViewChild('row')
  rowElement: ElementRef;

  @Input()
  rootElement: ElementRef;

  @ViewChild(VariantDrawerDirective)
  variantDrawer: VariantDrawerDirective;

  constructor(private lazyLoadingService: LazyLoadingServiceService) {}

  isVisible: boolean = false;

  ngAfterViewInit(): void {
    const self = this;

    this.lazyLoadingService.addSubPattern(
      this.rowElement.nativeElement.parentNode,
      this.rootElement,
      (isIntersecting) => {
        self.isVisible = isIntersecting;
      }
    );
  }
}
