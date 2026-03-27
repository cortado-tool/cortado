import {
  Component,
  ElementRef,
  Input,
  AfterViewInit,
  ContentChild,
} from '@angular/core';
import * as d3 from 'd3';
import { COLORS_BLUE } from 'src/app/objects/Colors';

@Component({
  selector: 'app-zoom-field',
  templateUrl: './zoom-field.component.html',
  styleUrls: ['./zoom-field.component.css'],
})
export class ZoomFieldComponent implements AfterViewInit {
  constructor(private editorWindow: ElementRef) {}

  @ContentChild('content')
  content: ElementRef;

  @Input()
  computeFocusOffsets: (any) => [number, number];

  @Input()
  computeCenterOffsets: (any) => [number, number];

  @Input()
  clkCallback;

  @Input()
  rghtClkCallback;

  @Input()
  dblClkCallback;

  @Input()
  shortCutCallbacks: Map<string, (any) => [number, number]>;

  @Input()
  zoomScale: [number, number];

  private zoom: any;

  ngAfterViewInit(): void {
    this.initalCenterContent();
    this.addZoomFunctionality();

    this.content.nativeElement.addEventListener('click', (event) => {
      console.log('click event in zoom field');
      if (this.clkCallback) {
        this.clkCallback(event);
      }
    });
  }

  private initalCenterContent() {
    const boundingRect = (
      this.editorWindow.nativeElement as HTMLElement
    ).getBoundingClientRect();
    d3.select(this.content.nativeElement)
      .select('g')
      .attr(
        'transform',
        `translate(${boundingRect.width / 2}, ${boundingRect.height / 2})`
      );
  }

  private addZoomFunctionality(): void {
    const zoomGroup = d3.select(this.content.nativeElement);

    const zooming = function (event) {
      d3.select(this.content.nativeElement)
        .select('g')
        .attr(
          'transform',
          event.transform.translate(
            this.editorWindow.nativeElement.offsetWidth / 2,
            this.editorWindow.nativeElement.offsetHeight / 2
          )
        );
    }.bind(this);

    this.zoom = d3.zoom().scaleExtent(this.zoomScale).on('zoom', zooming);

    zoomGroup.call(this.zoom).on('dblclick.zoom', null);
  }

  centerContent(animationDuration: number) {
    const svg = d3.select(this.content.nativeElement);
    const variantElement = d3.select(this.content.nativeElement).select('g');
    const [translateX, translateY] = this.computeCenterOffsets
      ? this.computeCenterOffsets(svg)
      : [0, 0];
    d3.select(this.content.nativeElement)
      .transition()
      .duration(animationDuration)
      .ease(d3.easeExpInOut)
      .call(
        this.zoom.transform,
        d3.zoomIdentity.translate(
          translateX - +variantElement.attr('width') / 2,
          translateY
        )
      );
  }

  focusSelected(animationDuration: number) {
    const svg = d3.select(this.content.nativeElement);
    const [translateX, translateY] = this.computeFocusOffsets
      ? this.computeFocusOffsets(svg)
      : [0, 0];
    console.log('offset');
    console.log(translateX, translateY);
    svg
      .transition()
      .duration(animationDuration)
      .ease(d3.easeExpInOut)
      .call(
        this.zoom.transform,
        d3.zoomIdentity.translate(translateX, translateY)
      );
  }
}
