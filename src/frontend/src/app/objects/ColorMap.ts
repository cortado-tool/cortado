export const ZERO_VALUE_COLOR = '#FFFFFF';

export class ColorMap {
  scale: d3.ScaleThreshold<any, any, any>;

  constructor(scale: d3.ScaleThreshold<any, any, any>) {
    this.scale = scale;
  }

  getColor(value: number) {
    return this.scale(value);
  }

  domain() {
    return this.scale.domain();
  }

  range() {
    return this.scale.range();
  }
}
