const {app, BrowserWindow, dialog, ipcMain} = require('electron')
var fs = require('fs');
const { showSaveDialog } = require("./util");
const nativeImage = require('electron').nativeImage
const url = require("url");
const path = require("path");
const kill = require("tree-kill")
const ChildProcess = require('child_process');
const Store = require('electron-store');
const executablePath = app.getPath('exe');
const downloadFolder = app.getPath('downloads')
const backendWorkDirWindows = executablePath.substring(0, executablePath.lastIndexOf("\\")) +
"\\cortado-backend";
const backendWorkDirLinux = executablePath.substring(0, executablePath.lastIndexOf("/")) +
  "/cortado-backend";
let backendWorkDirMac = executablePath.substring(0, executablePath.lastIndexOf("/"))
backendWorkDirMac = backendWorkDirMac.substring(0, backendWorkDirMac.lastIndexOf("/")) +
  "/cortado-backend";
const backendExecutablePathWindows = '"' + executablePath.substring(0, executablePath.lastIndexOf("\\")) +
  "\\cortado-backend\\cortado-backend.exe" + '"';
const backendExecutablePathLinux = executablePath.substring(0, executablePath.lastIndexOf("/")) +
  "/cortado-backend/cortado-backend";
const backendExecutablePathMac = backendWorkDirMac +
  "/cortado-backend";
const lastAcceptedVersionKey = "lastAcceptedVersion";

let mainCortadoWin;
let backendProcess;
let licenseDialog;

function startBackend() {
  switch (process.platform) {
    case 'linux':
      return ChildProcess.spawn(backendExecutablePathLinux, {shell: true, detached: true, windowsHide: false, cwd: backendWorkDirLinux});
    case 'win32':
      return ChildProcess.spawn(backendExecutablePathWindows, {shell: true, detached: true, windowsHide: false, cwd: backendWorkDirWindows});
    default:
      return ChildProcess.spawn(backendExecutablePathMac, [], {shell: true, detached: true, windowsHide: false, cwd: backendWorkDirMac});
  }
}

function createLicenseDialog(){
  licenseDialog = new BrowserWindow({
    //parent: mainCortadoWin,
    modal: true,
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  licenseDialog.removeMenu();
  licenseDialog.loadFile("license-dialog.html");
}

ipcMain.on('restartBackend', () => {
  console.log('Restarting Backend')
  killBackendProcess();
  backendProcess = startBackend();
})

ipcMain.on('license-dialog', (event, arg) => {
  if (arg === 'accepted'){ // Refer to license-dialog.js
    const store = new Store();
    store.set(lastAcceptedVersionKey, app.getVersion());
    backendProcess = startBackend();
    createMainApplicationWindow();
    licenseDialog.close();
    ipcMain.removeAllListeners('license-dialog');
  } else if (arg === 'denied') {
    app.quit()
  }
})

ipcMain.on('showSaveDialog', ((_, fileName, fileExtension, base64File, buttonLabel, title) => {
  showSaveDialog(downloadFolder, dialog, fs, mainCortadoWin, fileName, fileExtension, base64File, buttonLabel, title)
}));

function createMainApplicationWindow() {
  mainCortadoWin = new BrowserWindow({
    minHeight: 600,
    minWidth: 1280,
    width: 1280,
    height: 800,
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
    },
    iconUrl: "./icon/cortado_icon_colorful_transparent.png",
    darkTheme: true
  });
  mainCortadoWin.removeMenu();
  //mainCortadoWin.webContents.openDevTools()
  //mainCortadoWin.loadURL('data:text/html;charset=utf-8,' + backendExecutablePathWindows);
  mainCortadoWin.loadFile('dist/index.html');
  mainCortadoWin.on('closed', function () {
    mainCortadoWin = null;
    app.quit();
  });

  // prevent external links from being opened in an electron window
  mainCortadoWin.webContents.on('new-window', function (e, url) {
    e.preventDefault();
    require('electron').shell.openExternal(url);
  });
}

function killBackendProcess() {
  if (backendProcess){
    if (process.platform == 'win32'){
      kill(backendProcess.pid);
    } 
    else {
      ChildProcess.execSync("killall -9 cortado-backend", {shell: '/bin/sh'});
    }
  }
}

//app.on('ready', createWindow);
app.whenReady().then(function () {
  const store = new Store();
  const lastAcceptedVersion = store.get(lastAcceptedVersionKey);
  if (lastAcceptedVersion === app.getVersion()) {
    backendProcess = startBackend();
    createMainApplicationWindow();
    return;
  }

  createLicenseDialog(); // ipcMain handles opening the frontend and backend
});

app.on("quit", function () {
  killBackendProcess();
});

app.on('window-all-closed', function () {
  //On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
    //macOS specific
    if (mainCortadoWin === null) {
      createMainApplicationWindow();
    }
  }
);