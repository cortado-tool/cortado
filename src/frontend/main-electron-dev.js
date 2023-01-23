const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron')
var fs = require('fs');
// const mainRemote = require("@electron/remote/main");
const url = require("url");
const path = require("path");
const { showSaveDialog } = require("./util");
const downloadFolder = app.getPath('downloads')

let win;

function createWindow() {
  win = new BrowserWindow({
    minHeight: 600,
    minWidth: 800,
    width: 1280,
    height: 800,
    frame: true,
    titleBarStyle: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true
    },
    icon: "./icon/cortado_icon_colorful_transparent.png"
  })

  win.removeMenu();

  win.loadURL('http://localhost:4444')

  win.webContents.openDevTools()

  win.on('closed', function () {
    win = null
  })

  // prevent external links from being opened in an electron window
  win.webContents.on('new-window', function (e, url) {
    e.preventDefault();

    require('electron').shell.openExternal(url);
  });

  // mainRemote.initialize();
  // mainRemote.enable(win.webContents);

}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  //On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('restartBackend', () => {
  console.log('DEV: Restarting Backend')
})

app.on('activate', function () {
  //macOS specific
  if (win === null) {
    createWindow()
  }
}
)

ipcMain.on('showSaveDialog', ((_, fileName, fileExtension, base64File, buttonLabel, title) => {
  showSaveDialog(downloadFolder, dialog, fs, win, fileName, fileExtension, base64File, buttonLabel, title)
}));


