import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, skip, tap } from 'rxjs/operators';
import { Configuration } from 'src/app/components/settings/model';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private _onSettingChange: BehaviorSubject<Configuration> =
    new BehaviorSubject({} as Configuration);

  private _changedSetting: BehaviorSubject<Configuration> = new BehaviorSubject(
    null
  );

  constructor() {}

  public get changedSetting(): Observable<any> {
    return this._changedSetting.asObservable().pipe(
      skip(2),
      filter((val) => !_.isEmpty(val))
    );
  }

  public get onSettingChange(): Observable<Configuration> {
    return this._onSettingChange.asObservable();
  }

  public notify(setting: Configuration) {
    this._changedSetting.next(
      this.getDifference(this._onSettingChange.value, setting)
    );
    this._onSettingChange.next(setting);
  }

  public getDifference(prev, curr): Configuration {
    return _.omitBy(curr, (v, k) => prev[k] === v) as Configuration;
  }
}
