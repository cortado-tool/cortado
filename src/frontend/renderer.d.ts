

export interface IElectronAPI {
  requestRestart: () => void,
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
