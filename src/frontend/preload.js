const { contextBridge, ipcRenderer } = require('electron')

console.warn('Running Preload Script...')

contextBridge.exposeInMainWorld('electronAPI', {
  requestRestart: () => ipcRenderer.send('restartBackend'),
  showSaveDialog: (fileName, fileExtension, base64File, buttonLabel, title) =>
    ipcRenderer.send('showSaveDialog', fileName, fileExtension, base64File, buttonLabel, title)
})


document.onreadystatechange = function () {
  if (document.readyState == "complete") {
    const $ = require('jquery'); // Make Jquery Aviable in the Window after load

  }
}
