import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  OnInit,
  ViewChildren,
  QueryList,
  OnDestroy,
} from '@angular/core';
import { ColorMapService } from 'src/app/services/colorMapService/color-map.service';
import * as d3 from 'd3';
import { VariantDrawerDirective } from 'src/app/directives/variant-drawer/variant-drawer.directive';
import { Variant } from 'src/app/objects/Variants/variant';
import {
  LeafNode,
  VariantElement,
} from 'src/app/objects/Variants/variant_element';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-activity-button-area',
  templateUrl: './activity-button-area.component.html',
  styleUrls: ['./activity-button-area.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityButtonAreaComponent
  implements OnChanges, OnInit, OnDestroy
{
  constructor(private colorMapService: ColorMapService) {}

  @Input()
  activityNames: Array<string> = [];
  activityDummyVariants: Map<String, LeafNode> = new Map<string, LeafNode>();

  @Output()
  activityButtonClick = new EventEmitter();

  @ViewChildren(VariantDrawerDirective)
  activityButtons: QueryList<VariantDrawerDirective>;

  colorMap: Map<string, string> = new Map<string, string>();

  private _destroy$ = new Subject();

  ngOnInit() {
    this.activityDummyVariants = new Map<string, LeafNode>();

    for (let activity of this.activityNames) {
      const leaf = new LeafNode([activity]);
      leaf.setExpanded(true);
      this.activityDummyVariants.set(activity, leaf);
    }

    this.colorMapService.colorMap$
      .pipe(takeUntil(this._destroy$))
      .subscribe((map) => {
        this.colorMap = map;
        if (this.activityButtons) {
          for (let button of this.activityButtons) {
            button.redraw();
          }
        }
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  onActivityButtonClick(elem: SVGElement, activity: any) {
    this.activityButtonClick.emit({ svg: elem, activityName: activity });
  }

  computeActivityColor = (
    self: VariantDrawerDirective,
    element: VariantElement,
    variant: Variant
  ) => {
    let color;
    color = this.colorMap.get(element.asLeafNode().activity[0]);

    if (!color) {
      color = '#d3d3d3'; // lightgrey
    }

    return color;
  };

  onMouseOverCbFc = (
    drawerDirective: VariantDrawerDirective,
    element: VariantElement,
    variant: VariantElement,
    selection
  ) => {
    selection
      .on('mouseover', function (event, d) {
        const rgb_code = d3
          .select(this)
          .select('polygon')
          .attr('style')
          .match(/[\d.]+/g);
        const lightend = rgb_code.map((d) =>
          parseInt(d) + 50 > 255 ? 255 : parseInt(d) + 50
        );

        d3.select(this)
          .select('polygon')
          .style('fill', `rgb(${lightend[0]},${lightend[1]},${lightend[2]})`)
          .style('stroke-width', 2);
      })
      .on('mouseout', function (event, d) {
        const rgb_code = d3
          .select(this)
          .select('polygon')
          .attr('style')
          .match(/[\d.]+/g);
        const darkend = rgb_code.map((d) =>
          parseInt(d) - 50 < 0 ? 0 : parseInt(d) - 50
        );

        d3.select(this)
          .select('polygon')
          .style('fill', `rgb(${darkend[0]},${darkend[1]},${darkend[2]})`);
      });
  };

  ngOnChanges(changes: SimpleChanges): void {
    // A somewhat crude way to trigger a redraw after the value did change and preventing it from firing on the initalization
    // Review when the colormap might change after init
    this.activityDummyVariants = new Map<string, LeafNode>();

    for (let activity of changes.activityNames.currentValue) {
      const leaf = new LeafNode([activity]);
      leaf.setExpanded(true);
      this.activityDummyVariants.set(activity, leaf);
    }
  }
}
