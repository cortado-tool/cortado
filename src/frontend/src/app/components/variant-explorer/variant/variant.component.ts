import {
  AfterViewInit,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';

import { LazyLoadingServiceService } from 'src/app/services/lazyLoadingService/lazy-loading.service';
import { InfixType } from 'src/app/objects/Variants/infix_selection';
import { Variant } from 'src/app/objects/Variants/variant';
import { ViewMode } from 'src/app/objects/ViewMode';
import { VariantViewModeService } from 'src/app/services/viewModeServices/variant-view-mode.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-variant]',
  templateUrl: './variant.component.html',
  styleUrls: ['./variant.component.scss'],
})
export class VariantComponent implements AfterViewInit {
  @ContentChild('variantInfo') variantInfo!: TemplateRef<any>;
  @ContentChild('treeButton') treeButton!: TemplateRef<any>;
  @ContentChild('variantDrawer') variantDrawer!: TemplateRef<any>;
  @ContentChild('subvariantButton') subvariantButton!: TemplateRef<any>;
  @ContentChild('infixSelection') infixSelection!: TemplateRef<any>;
  @ContentChild('removeVariantButton') removeVariantButton!: TemplateRef<any>;

  @Input()
  index: number;

  @Input()
  variant: Variant;

  @Input()
  rootElement: ElementRef;

  @Input()
  traceInfixSelectionMode: boolean = false;

  @Input()
  processTreeAvailable: boolean = false;

  @Output() clickCbFc: EventEmitter<any> = new EventEmitter();

  @ViewChild('row')
  rowElement: ElementRef;

  isVisible: boolean = false;

  // necessary because one cannot use it directly in the template file
  infixType = InfixType;

  public VM = ViewMode;

  constructor(
    private lazyLoadingService: LazyLoadingServiceService,
    public variantViewModeService: VariantViewModeService
  ) {}

  ngAfterViewInit(): void {
    const self = this;

    this.lazyLoadingService.addVariant(
      this.rowElement.nativeElement.parentNode,
      this.rootElement,
      (isIntersecting) => {
        self.isVisible = isIntersecting;
      }
    );
  }

  isExpanded(): boolean {
    return this.variant.variant.expanded;
  }
}
