import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as constants from './predefinedColors';

@Injectable({
  providedIn: 'root',
})
export class ColorMapService {
  constructor() {}

  createColorMap(activities: string[]): void {
    //TODO: ensure activities are ordered based on frequency
    // Note that the color map also contains keys for deleted activities because the removal can be reverted afterwards
    const colorMap: Map<string, string> = new Map();
    activities.sort();
    activities.forEach((a, i) => {
      colorMap.set(a, this.get_color(i));
    });
    this._colorMap.next(colorMap);
  }

  changeActivityColor(activity: string, color: string): void {
    let colorMap: Map<string, string> = this._colorMap.getValue();
    colorMap.set(activity, color);
    this._colorMap.next(colorMap);
  }

  // tslint:disable-next-line:variable-name
  private _colorMap = new BehaviorSubject<Map<string, string>>(null);

  get colorMap$(): Observable<Map<string, string>> {
    return this._colorMap.asObservable().pipe(filter((map) => map !== null));
  }

  get colorMap(): Map<string, string> {
    return this._colorMap.getValue();
  }

  set colorMap(newColorMap: Map<string, string>) {
    this._colorMap.next(newColorMap);
  }

  private get_color(activityNameCount): string {
    let color = '';
    if (activityNameCount >= constants.colorRange.length) {
      color = this.generate_random_color();
      while (constants.colorRange.includes(color)) {
        color = this.generate_random_color();
      }
    } else {
      color = constants.colorRange[activityNameCount];
    }
    return color;
  }

  private generate_random_color(): string {
    const color =
      '#' + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6);
    return color;
  }

  public renameColorInActivityColorMap(activityName, newActivityName) {
    if (!this.colorMap.get(newActivityName)) {
      this.changeActivityColor(
        newActivityName,
        this.colorMap.get(activityName)
      );
    }
  }
}
