import { Injectable } from '@angular/core';
import { BehaviorSubject, timer, Observable } from 'rxjs';
import { BackendService } from '../backendService/backend.service';

@Injectable({
  providedIn: 'root',
})
export class BackendInfoService {
  private isRunning: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  private timer = timer(10000, 10000);

  constructor(private backendService: BackendService) {
    this.timer.subscribe((_) => {
      this.backendService.getInfo().subscribe(
        () => this.setRunning(true),
        () => this.setRunning(false)
      );
    });
  }

  public setRunning(isRunning: boolean): void {
    this.isRunning.next(isRunning);
  }

  public getIsRunningSubscription(): Observable<boolean> {
    return this.isRunning.asObservable();
  }
}
