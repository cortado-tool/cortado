import { Injectable } from '@angular/core';
import { delay, retryWhen, take, tap } from 'rxjs/operators';
import { BackendInfoService } from './backendInfoService/backend-info.service';
import { BackendService } from './backendService/backend.service';
import { ROUTES } from '../constants/backend_route_constants';
import { ElectronService } from './electronService/electron.service';

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
    private backendInfoService: BackendInfoService,
    private electronService: ElectronService
  ) {}

  init = async () => {
    //let port = await this.electronService.getWSPort();
    //console.log('got the port from electron API: ' + port);
    //this.changePort(port);

    return this.backendService
      .getInfo()
      .pipe(retryWhen((errors) => errors.pipe(delay(500), take(100)))) // wait for backend
      .pipe(tap(() => this.backendInfoService.setRunning(true))) // set running status
      .toPromise();
  };

  changePort(port: number) {
    ROUTES.BASE_URL = '127.0.0.1:' + port + '/';
    //ROUTES.BASE_URL = '11.62.16.121:' + port + '/';
    ROUTES.HTTP_BASE_URL = 'http://' + ROUTES.BASE_URL;
    ROUTES.WS_HTTP_BASE_URL = 'ws://' + ROUTES.BASE_URL;
  }
}
