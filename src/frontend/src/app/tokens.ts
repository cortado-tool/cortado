import { InjectionToken } from '@angular/core';
import { ElectronServiceInterface } from './services/electronService/electron.service';

export let ELECTRON_SERVICE = new InjectionToken<ElectronServiceInterface>(
  'electronService'
);
