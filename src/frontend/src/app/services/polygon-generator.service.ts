import { VARIANT_Constants } from './../constants/variant_element_drawer_constants';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PolygonGeneratorService {
  constructor() {}

  private cache = new Map<string, string>();

  getPolygonPoints(width: number, height: number): string {
    let key = `${width},${height}`;
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    let x = 0,
      y = 0;
    let headLength =
      Math.tan((VARIANT_Constants.ARROW_HEAD_ANGLE / 360) * Math.PI * 2) *
      (height / 2);

    width -= headLength;

    let points = [];
    points.push(`${x},${y}`); // Top left
    points.push(`${x + width},${y}`); // Top right
    points.push(`${x + width + headLength},${y + height / 2}`); // Arrow Head
    points.push(`${x + width},${y + height}`); // Bottom right
    points.push(`${x},${y + height}`); // Bottom left
    points.push(`${x + headLength},${y + height / 2}`); // Arrow feather

    let str = points.join(' ');
    this.cache.set(key, str);

    return str;
  }
}
