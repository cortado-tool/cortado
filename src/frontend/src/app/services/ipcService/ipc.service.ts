import { Injectable } from '@angular/core';

declare var electron: any;

@Injectable({
  providedIn: 'root',
})
export class IpcService {
  private ipcRenderer = electron.ipcRenderer;

  constructor() {}

  public send(channel, data): void {
    this.ipcRenderer.send(channel, data);
  }

  public receive(channel, func: Function) {
    this.ipcRenderer.on(channel, (event: any, ...args: any) => func(...args));
  }
}
