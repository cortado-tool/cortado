import { Injectable } from '@angular/core';
import { delay, retryWhen, take, tap } from 'rxjs/operators';
import { BackendInfoService } from './backendInfoService/backend-info.service';
import { BackendService } from './backendService/backend.service';

export function initApp(initService: InitService) {
  return (): Promise<any> => {
    return initService.init();
  };
}

@Injectable({
  providedIn: 'root',
})
export class InitService {
  constructor(
    private backendService: BackendService,
    private backendInfoService: BackendInfoService
  ) {}

  init() {
    return this.backendService
      .getInfo()
      .pipe(retryWhen((errors) => errors.pipe(delay(500), take(100)))) // wait for backend
      .pipe(tap(() => this.backendInfoService.setRunning(true))) // set running status
      .toPromise();
  }
}
