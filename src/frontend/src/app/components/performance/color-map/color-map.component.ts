import { Component, Input } from '@angular/core';
import { ColorMap, ZERO_VALUE_COLOR } from 'src/app/objects/ColorMap';

@Component({
  selector: 'app-color-map',
  templateUrl: './color-map.component.html',
  styleUrls: ['./color-map.component.scss'],
})
export class ColorMapComponent {
  @Input()
  colorMapValues: ColorMapValue[];
  @Input()
  timeBasedLabel: Boolean = true;
  @Input()
  suffix: string = '';
  @Input()
  excludeUpperLabel: Boolean = false;

  constructor() {}
}

export interface ColorMapValue {
  lowerBound: number;
  color: string;
}

export function buildColorValues(
  colorScale,
  values?: number[]
): ColorMapValue[] {
  let thresholds = colorScale.domain();
  if (values) {
    let min = Math.min(...values);
    let max = Math.max(...values);

    if (min != max) {
      // set min value to one for distinguishing the special value zero, which is always added to the thresholds later
      if (min < 0.5) {
        min += 1;
      }

      thresholds = [0, min, ...thresholds, max];
    } else thresholds = [min];
  }
  let colors = colorScale.range();
  colors = [...colors, null];
  return thresholds.map((t, i) => {
    let color = t < 0.5 ? ZERO_VALUE_COLOR : colors[i - 1];

    return {
      lowerBound: t,
      color: color,
    };
  });
}
