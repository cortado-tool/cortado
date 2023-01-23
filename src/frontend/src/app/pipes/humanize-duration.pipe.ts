import { Pipe, PipeTransform } from '@angular/core';
import {
  HumanizeDuration,
  HumanizeDurationLanguage,
  HumanizeDurationOptions,
} from 'humanize-duration-ts';

@Pipe({
  name: 'humanizeDuration',
})
export class HumanizeDurationPipe implements PipeTransform {
  private shortEnLang = {
    shortEn: {
      y: () => 'y',
      mo: () => 'mo',
      w: () => 'w',
      d: () => 'd',
      h: () => 'h',
      m: () => 'm',
      s: () => 's',
      ms: () => 'ms',
      decimal: ',',
    },
  };

  constructor() {
    const durationLang = new HumanizeDurationLanguage();
    this.humanizeDuration = new HumanizeDuration(durationLang);
  }

  humanizeDuration: HumanizeDuration;

  public static apply(
    value: number,
    options?: HumanizeDurationOptions
  ): string {
    return new HumanizeDurationPipe().humanizeDuration.humanize(value, options);
  }

  transform(
    value: number,
    isMilliseconds = false,
    round = true,
    largest?: number,
    shortEn = false
  ): string {
    if (!isMilliseconds) {
      value = value * 1000;
    }

    const options: HumanizeDurationOptions = { round, largest };
    if (shortEn) {
      options.languages = this.shortEnLang;
      options.language = 'shortEn';
      options.spacer = '';
    }
    return this.humanizeDuration.humanize(value, options);
  }
}
