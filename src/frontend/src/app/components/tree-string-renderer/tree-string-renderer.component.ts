import {
  Component,
  ElementRef,
  OnInit,
  Renderer2 as Renderer,
  ViewChild,
  Input,
  SimpleChanges,
  OnChanges,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ColorMapService } from 'src/app/services/colorMapService/color-map.service';

// TODO Bring these to a more convenient place
const SEQUENCE_CHAR = '\u2794';
const CHOICE_CHAR = '\u2715';
const LOOP_CHAR = '\u21BA';
const PARALLELISM_CHAR = '\u2227';
const TAU_CHAR = '\u03C4';

@Component({
  selector: 'app-tree-string-renderer',
  templateUrl: './tree-string-renderer.component.html',
  styleUrls: ['./tree-string-renderer.component.css'],
})
export class TreeStringRendererComponent
  implements OnChanges, AfterViewInit, OnDestroy
{
  activityNameRegEx = new RegExp("'([^']*)'", 'g');
  activityColorMap: Map<string, string>;

  @ViewChild('styledText') styledTextDiv: ElementRef<HTMLDivElement>;
  @Input() styled_tree_string: string;

  // Simple Class overwrite for local styling
  @Input() custom_class: string;

  private _destroy$ = new Subject();

  constructor(
    private colorMapService: ColorMapService,
    private renderer: Renderer
  ) {}

  ngAfterViewInit() {
    this.colorMapService.colorMap$
      .pipe(takeUntil(this._destroy$))
      .subscribe((colorMap) => {
        this.activityColorMap = colorMap;

        if (this.styled_tree_string) {
          this.styleText(this.styled_tree_string);
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const styled_tree_string = changes['styled_tree_string'].currentValue;
    if (styled_tree_string && this.activityColorMap) {
      this.styleText(styled_tree_string);
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  styleText(value: string) {
    value = this.colorActivityNames(value);
    value = this.replacePlaceHolderOperatorString(value);

    // This presents a possible vulnerability for remote code execution, add sanitisation or change input mode, when this presents a serious issue.
    this.renderer.setProperty(
      this.styledTextDiv.nativeElement,
      'innerHTML',
      value
    );
  }

  // Color activity names of known activities in the colormap color and highlight those of unknown name
  colorActivityNames(value: any): string {
    const matches = value.matchAll(this.activityNameRegEx);
    let knownActivities = new Set();
    let unknowActivities = new Set();

    for (let match of matches) {
      if (this.activityColorMap.has(match[1])) {
        knownActivities.add(match[1]);
      } else {
        unknowActivities.add(match[1]);
      }
    }

    knownActivities.forEach((activityName: string) => {
      value = value.replace(
        new RegExp("'" + activityName + "'", 'g'),
        `'<b><span style="color:${this.activityColorMap.get(activityName)}">` +
          activityName +
          "</span></b>'"
      );
    });

    unknowActivities.forEach((activityName: string) => {
      value = value.replace(
        new RegExp("'" + activityName + "'", 'g'),
        '\'<span class="warning-highlight">' + activityName + "</span>'"
      );
    });

    return value;
  }

  // Replace
  replacePlaceHolderOperatorString(value: string): string {
    value = value
      .replace(/\*tau\*/g, '<b>' + TAU_CHAR + '</b>')
      .replace(/\*[\s]*\(/g, '<b>' + LOOP_CHAR + '</b>' + '(')
      .replace(/X[\s]*\(/g, '<b>' + CHOICE_CHAR + '</b>' + '(')
      .replace(/\+[\s]*\(/g, '<b>' + PARALLELISM_CHAR + '</b>' + '(')
      .replace(/->[\s]*\(/g, '<b>' + SEQUENCE_CHAR + '</b>' + '(');

    return value;
  }
}
