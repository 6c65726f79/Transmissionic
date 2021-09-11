import { app, shell } from "electron";
import fs from "fs";
import { createCapacitorElectronApp } from "@capacitor-community/electron";
import { autoUpdater } from "electron-updater";
import windowStateKeeper from "electron-window-state";
require('@electron/remote/main').initialize();

// The MainWindow object can be accessed via myCapacitorApp.getMainWindow()
const myCapacitorApp = createCapacitorElectronApp({
  splashScreen: {
    useSplashScreen: false,
  },
  mainWindow: {
    windowOptions: {
      autoHideMenuBar: true,
      width: 990,
      height: 700,
      titleBarStyle: "hidden",
      frame: false,
      webPreferences: {
        devTools: false,
        contextIsolation: true
      }
    }
  }
});

const gotTheLock = app.requestSingleInstanceLock()
let openFiles: Array<Buffer>;
let openMagnet: String;

if (!gotTheLock) {
  app.quit()
} else {
  openFiles = getTorrents(process.argv);
  openMagnet = getMagnet(process.argv);

  app.setAsDefaultProtocolClient("magnet");

  app.on('second-instance', (event, commandLine) => {
    openFiles = getTorrents(commandLine);
    openMagnet = getMagnet(commandLine);
    const mainWindow = myCapacitorApp.getMainWindow();
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (openFiles.length>0) mainWindow.webContents.send('file-open', openFiles)
      if (openMagnet!=null) mainWindow.webContents.send('magnet-open', openMagnet)
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some Electron APIs can only be used after this event occurs.
  app.on("ready", () => {
    let mainWindowState = windowStateKeeper({
      defaultWidth: 990,
      defaultHeight: 700
    });
    myCapacitorApp.init();
    const mainWindow = myCapacitorApp.getMainWindow();
    if(mainWindowState.x && mainWindowState.y){
      mainWindow.setPosition(mainWindowState.x,mainWindowState.y);
    }
    mainWindow.setSize(mainWindowState.width,mainWindowState.height);
    autoUpdater.checkForUpdatesAndNotify();
    mainWindowState.manage(mainWindow);
    if (mainWindow) {
      mainWindow.webContents.on('did-finish-load', function() {
        if(openFiles.length>0){
          mainWindow.webContents.send('file-open', openFiles);
        }
        if(openMagnet!=null){
          mainWindow.webContents.send('magnet-open', openMagnet);
        } 
      });
    }
  });
}

app.on('open-file', (event, path) => {
  // Support for Mac OS
  openFiles=[fs.readFileSync(path, null)];
  const mainWindow = myCapacitorApp.getMainWindow();
  mainWindow.webContents.send('fileopen', openFiles)
})

app.on('web-contents-created', (createEvent, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' }
  })
});

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (myCapacitorApp.getMainWindow().isDestroyed()) myCapacitorApp.init();
});

// Define any IPC or other custom functionality below here
function getTorrents(args: Array<any>): Array<Buffer> {
  const result=[];
  args.forEach((arg: string) => {
    if(arg && arg.toLowerCase().endsWith(".torrent")){
      result.push(fs.readFileSync(arg, null));
    }
  });
  return result;
}

function getMagnet(args: Array<any>): String {
  let result=null;
  args.forEach((arg: string) => {
    if(arg && arg.toLowerCase().startsWith("magnet:") && result==null){
      result = arg;
    }
  })
  return result;
}