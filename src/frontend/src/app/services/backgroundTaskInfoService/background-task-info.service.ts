import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BackgroundTask } from './model';

@Injectable({
  providedIn: 'root',
})
export class BackgroundTaskInfoService {
  constructor() {}

  activeRequests = new Map<number, BackgroundTask>();

  private currentBackgroundTask = new BehaviorSubject<BackgroundTask>(
    undefined
  );

  private numberBackgroundTask = new BehaviorSubject<number>(0);

  public setRequest(
    description: string,
    cancellationFunc: Function = null
  ): number {
    const id = Math.random();
    this.activeRequests.set(
      id,
      new BackgroundTask(description, cancellationFunc)
    );
    this.currentBackgroundTask.next(this.activeRequests.values().next().value);
    this.numberBackgroundTask.next(this.numberBackgroundTask.getValue() + 1);
    return id;
  }

  public removeRequest(id: number): void {
    this.activeRequests.delete(id);
    this.currentBackgroundTask.next(this.activeRequests.values().next().value);
    this.numberBackgroundTask.next(this.numberBackgroundTask.getValue() - 1);
  }

  public currentBackgroundTask$(): Observable<BackgroundTask> {
    return this.currentBackgroundTask.asObservable();
  }

  public numberBackgroundTasks$(): Observable<number> {
    return this.numberBackgroundTask.asObservable();
  }
}
