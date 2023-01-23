import { Injectable } from '@angular/core';
import { blobToBase64 } from 'src/app/utils/util';

@Injectable()
export class ElectronService implements ElectronServiceInterface {
  private electronApi = (<any>window).electronAPI;

  constructor() {}

  public async showSaveDialog(
    fileName: string,
    fileExtension: string,
    blob: Blob,
    buttonLabel: string,
    title: string
  ) {
    let base64File = await blobToBase64(blob);

    this.electronApi.showSaveDialog(
      fileName,
      fileExtension,
      base64File,
      buttonLabel,
      title
    );
  }
}

export interface ElectronServiceInterface {
  showSaveDialog(
    fileName: string,
    fileExtension: string,
    blob: Blob,
    buttonLabel: string,
    title: string
  );
}
