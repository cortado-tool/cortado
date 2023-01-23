import { ColorMapService } from './../colorMapService/color-map.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TimeUnit } from 'src/app/objects/TimeUnit';
import { Variant } from 'src/app/objects/Variants/variant';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  [x: string]: any;
  constructor(private colorMapService: ColorMapService) {}

  public performanceInfoAvailable = false;
  private _timeGranularity: BehaviorSubject<TimeUnit> = new BehaviorSubject(
    TimeUnit.SEC
  );

  private _numberFittingTraces: number = undefined;
  private _numberFittingVariants: number = undefined;
  private _totalNumberTraces: number = 0;
  private _totalNumberVariants: number = 0;

  private _logStatistics = new BehaviorSubject<LogStats>(
    new LogStats(
      this._numberFittingTraces,
      this._numberFittingVariants,
      this._totalNumberTraces,
      this._totalNumberVariants
    )
  );

  get logStatistics$(): Observable<LogStats> {
    return this._logStatistics.asObservable();
  }

  set logStatistics(logStats: LogStats) {
    this._logStatistics.next(logStats);
  }

  get logStatistics(): LogStats {
    return this._logStatistics.getValue();
  }

  public update_log_stats(
    numberFittingTraces: number = null,
    numberFittingVariants: number = null,
    totalNumberTraces: number = null,
    totalNumberVariants: number = null
  ): void {
    if (numberFittingTraces) this._numberFittingTraces = numberFittingTraces;
    if (numberFittingVariants)
      this._numberFittingVariants = numberFittingVariants;
    if (totalNumberTraces) this._totalNumberTraces = totalNumberTraces;
    if (totalNumberVariants) this._totalNumberVariants = totalNumberVariants;

    this.logStatistics = new LogStats(
      this._numberFittingTraces,
      this._numberFittingVariants,
      this._totalNumberTraces,
      this._totalNumberVariants
    );
  }

  // Runs Code that should be run everytime the event log changes
  private eventLogChanged(): void {
    this.colorMapService.createColorMap(Object.keys(this.activitiesInEventLog));
  }

  private _logGranularity: BehaviorSubject<TimeUnit> = new BehaviorSubject(
    TimeUnit.SEC
  );

  public get logGranularity$(): Observable<TimeUnit> {
    return this._logGranularity.asObservable();
  }

  public get logGranularity(): TimeUnit {
    return this._logGranularity.value;
  }

  public set logGranularity(value: TimeUnit) {
    this._logGranularity.next(value);
  }

  private _loadedEventLog = new BehaviorSubject<string>('');

  get loadedEventLog$(): Observable<string> {
    return this._loadedEventLog.asObservable();
  }

  set loadedEventLog(name: string) {
    this.eventLogChanged();

    this._loadedEventLog.next(name);
  }

  private _activitiesInEventLog = new BehaviorSubject<Set<string>>(new Set());

  get activitiesInEventLog$(): Observable<any> {
    return this._activitiesInEventLog.asObservable();
  }

  set activitiesInEventLog(activities: any) {
    this._activitiesInEventLog.next(activities);
  }

  get activitiesInEventLog(): any {
    return this._activitiesInEventLog.getValue();
  }

  public deleteActivityInEventLog(activityName: string): any {
    let activities = {};
    for (let activity in this.activitiesInEventLog) {
      if (activity !== activityName) {
        activities[activity] = this.activitiesInEventLog[activity];
      }
    }

    this.activitiesInEventLog = activities;
  }

  public renameActivitiesInEventLog(
    activityName: string,
    newActivityName: string
  ): any {
    // modifying related data in shared data service. Similar to processEventLog in backend service
    // relabeling activities

    let activityNameMapping: Map<string, string> = new Map();
    for (let activity in this.activitiesInEventLog) {
      activityNameMapping.set(activity, activity);
    }

    activityNameMapping.set(activityName, newActivityName);

    let activities = {};
    for (let activity in this.activitiesInEventLog) {
      let newActivityName = activityNameMapping.get(activity);
      if (!activities[newActivityName]) {
        activities[newActivityName] = this.activitiesInEventLog[activity];
      } else {
        activities[newActivityName] += this.activitiesInEventLog[activity];
      }
    }

    if (this.endActivitiesInEventLog.delete(activityName))
      this.endActivitiesInEventLog.add(newActivityName);
    if (this.startActivitiesInEventLog.delete(activityName))
      this.startActivitiesInEventLog.add(newActivityName);

    this.activitiesInEventLog = activities;
  }

  public get timeGranularity$(): Observable<TimeUnit> {
    return this._timeGranularity.asObservable();
  }
  public set timeGranularity(value: TimeUnit) {
    this._timeGranularity.next(value);
  }

  private _startActivitiesInEventLog = new BehaviorSubject<Set<string>>(
    new Set()
  );

  get startActivitiesInEventLog$(): Observable<Set<string>> {
    return this._startActivitiesInEventLog.asObservable();
  }

  set startActivitiesInEventLog(activities: Set<string>) {
    this._startActivitiesInEventLog.next(activities);
  }

  get startActivitiesInEventLog(): Set<string> {
    return this._startActivitiesInEventLog.getValue();
  }

  private _endActivitiesInEventLog = new BehaviorSubject<Set<string>>(
    new Set()
  );

  get endActivitiesInEventLog$(): Observable<Set<string>> {
    return this._endActivitiesInEventLog.asObservable();
  }

  set endActivitiesInEventLog(activities: Set<string>) {
    this._endActivitiesInEventLog.next(activities);
  }

  get endActivitiesInEventLog(): Set<string> {
    return this._endActivitiesInEventLog.getValue();
  }

  public computeLogStats(variants: Variant[]): void {
    const totalNumberTraces = variants
      .map((v) => v.count)
      .reduce((a, b) => a + b);

    variants.forEach((v) => {
      v.percentage = Number.parseFloat(
        ((v.count / totalNumberTraces) * 100).toFixed(2)
      );
    });

    const numberFittingVariants = 0;
    const numberFittingTraces = 0;
    const totalNumberVariants = variants.length;

    this.update_log_stats(
      numberFittingTraces,
      numberFittingVariants,
      totalNumberTraces,
      totalNumberVariants
    );
  }
}

export class LogStats {
  numberFittingTraces: number;
  numberFittingVariants: number;
  totalNumberTraces: number;
  totalNumberVariants: number;

  constructor(
    numberFittingTraces: number,
    numberFittingVariants: number,
    totalNumberTraces: number,
    totalNumberVariants: number
  ) {
    this.numberFittingTraces = numberFittingTraces;
    this.numberFittingVariants = numberFittingVariants;
    this.totalNumberTraces = totalNumberTraces;
    this.totalNumberVariants = totalNumberVariants;
  }
}
