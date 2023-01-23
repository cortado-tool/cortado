import { Inject, Injectable } from '@angular/core';
import * as d3 from 'd3';
import { saveAs } from 'file-saver';
import { ELECTRON_SERVICE } from 'src/app/tokens';
import { ElectronServiceInterface } from '../electronService/electron.service';

/***
A service that recieves SVG elements from member components and provides conversion and saving functionality.
***/

@Injectable({
  providedIn: 'root',
})
export class ImageExportService {
  constructor(
    @Inject(ELECTRON_SERVICE) private electronService: ElectronServiceInterface
  ) {}

  export(
    filename: string,
    width?: number,
    height?: number,
    ...svgs: SVGGraphicsElement[]
  ) {
    let svg = this.constructSVG(svgs);

    // TODO Add Conversion logic

    if (height) svg.svg_width = width;
    if (width) svg.svg_height = height;

    svg.store(filename, this.electronService);
  }

  constructSVG(svgs: SVGGraphicsElement[]): SVG {
    let svg = new SVG();
    svg.appendRight(svgs);
    return svg;
  }

  // TODO Implement in new Issue
  convert_svg_to_png() {}

  // TODO Implement in new Issue
  convert_svg_to_pdf() {}
}

class SVG {
  private mainSVG;

  private width = 0;
  private height = 0;

  constructor() {
    this.mainSVG = d3
      .create('svg')
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr(
        'font-family',
        '-apple-system,BlinkMacSystemFont,"Segoe UI", Roboto,\
                            "Helvetica Neue",Arial,"Noto Sans","Liberation Sans",\
                            sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol",\
                            "Noto Color Emoji"'
      );
  }

  public append(x: number, y: number, svgs: SVGGraphicsElement[]): SVG {
    let lastSVG;
    for (let svg of svgs) {
      const svgX = svg.getAttribute('x');
      const svgY = svg.getAttribute('y');

      lastSVG = this.mainSVG
        .append(svg.nodeName)
        .attr('x', svgX === null ? x : svgX)
        .attr('y', svgY === null ? y : svgY)
        .html(svg.innerHTML);

      for (let attr of svg.getAttributeNames()) {
        lastSVG.attr(attr, svg.getAttribute(attr));
      }

      y += Number.parseFloat(svg.getAttribute('height'));
      this.height = Math.max(this.height, y);
      this.width = Math.max(
        this.width,
        x + Number.parseFloat(svg.getAttribute('width'))
      );
    }
    return this;
  }

  public appendRight(svgs: SVGGraphicsElement[]) {
    return this.append(this.width, 0, svgs);
  }

  public appendBottom(svgs: SVGGraphicsElement[]) {
    return this.append(0, this.height, svgs);
  }

  public store(filename: string, electronService: ElectronServiceInterface) {
    this.mainSVG.attr('height', this.height);
    this.mainSVG.attr('width', this.width);

    const file = new Blob([this.mainSVG.node().outerHTML], {
      type: 'image/svg+xml',
    });
    //filename = filename.endsWith('.svg') ? filename : filename + '.svg';
    electronService.showSaveDialog(
      filename,
      'svg',
      file,
      'Save svg',
      'Save svg'
    );
    //saveAs(file, filename);
  }

  set svg_width(width: number) {
    this.width = width;
  }
  set svg_height(height: number) {
    this.height = height;
  }
}
