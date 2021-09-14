import type { CapacitorElectronConfig } from '@capacitor-community/electron';
import {
  getCapacitorElectronConfig,
  setupElectronDeepLinking,
} from '@capacitor-community/electron';
import { app, shell, Menu, ipcMain, net } from 'electron';
import fs from "fs";
import electronIsDev from 'electron-is-dev';
import unhandled from 'electron-unhandled';
import { autoUpdater } from 'electron-updater';

import {
  ElectronCapacitorApp,
  setupContentSecurityPolicy,
  setupReloadWatcher,
} from './setup';

let mainWindow: Electron.BrowserWindow;
let request: Electron.ClientRequest;
let openFiles: Array<Buffer>;
let openMagnet: String;

// Graceful handling of unhandled errors.
unhandled();

// Get Config options from capacitor.config
const capacitorFileConfig: CapacitorElectronConfig =
  getCapacitorElectronConfig();

// Initialize our app. You can pass menu templates into the app here.
// const myCapacitorApp = new ElectronCapacitorApp(capacitorFileConfig);
const myCapacitorApp = new ElectronCapacitorApp(
  capacitorFileConfig
);

// If deeplinking is enabled then we will set it up here.
if (capacitorFileConfig.electron?.deepLinkingEnabled) {
  setupElectronDeepLinking(myCapacitorApp, {
    customProtocol:
      capacitorFileConfig.electron.deepLinkingCustomProtocol ??
      'mycapacitorapp',
  });
}

// If we are in Dev mode, use the file watcher components.
if (electronIsDev) {
  setupReloadWatcher(myCapacitorApp);
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit()
} else {
  openFiles = getTorrents(process.argv);
  openMagnet = getMagnet(process.argv);

  // Run Application
  (async () => {
    // Wait for electron app to be ready.
    await app.whenReady();
    // Security - Set Content-Security-Policy based on whether or not we are in dev mode.
    setupContentSecurityPolicy(myCapacitorApp.getCustomURLScheme());
    // Initialize our app, build windows, and load content.
    await myCapacitorApp.init();
    // Check for updates if we are in a packaged app.
    if(net.online){
      autoUpdater.checkForUpdatesAndNotify();
    }

    setMainMenu();

    mainWindow = myCapacitorApp.getMainWindow();

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
  })();

  app.on('second-instance', (event, commandLine) => {
    openFiles = getTorrents(commandLine);
    openMagnet = getMagnet(commandLine);
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (openFiles.length>0) mainWindow.webContents.send('file-open', openFiles)
      if (openMagnet!=null) mainWindow.webContents.send('magnet-open', openMagnet)
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
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

// Handle when all of our windows are close (platforms have their own expectations).
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// When the dock icon is clicked.
app.on('activate', async function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (myCapacitorApp.getMainWindow().isDestroyed()) {
    await myCapacitorApp.init();
  }
});

// Place all ipc or other electron api calls and custom functionality under this line
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

ipcMain.handle('request', async (event, args) => {
  return new Promise(function (resolve, reject) {
    let result;
    request = net.request(args.options)
    request.on('response', (response) => {
      let content="";
      result={
        headers:response.headers,
        status:response.statusCode
      };

      response.on('end', () => {
        clearTimeout(timeout)
        if(content!="" && response.statusCode==200){
          result.data = JSON.parse(content);
        }
        resolve(result)
      })

      response.on('error', (error) => {
        reject(error.message);
      })

      response.on('data', (chunk) => {
        content += chunk.toString()
      })
    });
    request.on('error', function (error) {
      reject(error.message);
    })
    request.write(JSON.stringify(args.data))
    request.end()
    const timeout = setTimeout(() => {
      request.abort()
    },args.options.timeout*1000)
  });
})

function shortcutsHandler(shortcut: string) {
  mainWindow.webContents.send('shortcut', shortcut);
}

function setMainMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open torrent...',
          accelerator: 'Alt+T',
          click(): void {
            shortcutsHandler('add-torrent');
          }
        },
        {
          label: 'Open magnet',
          accelerator: 'Alt+M',
          click(): void {
            shortcutsHandler('add-magnet');
          }
        },
        {
          label: 'Open URL',
          accelerator: 'Alt+U',
          click(): void {
            shortcutsHandler('add-url');
          }
        },
        {
          type:'separator'
        },
        {
          label: 'Settings',
          accelerator: 'Alt+S',
          click(): void {
            shortcutsHandler('settings');
          }
        },
        {
          type:'separator'
        },
        {
          label: 'Exit',
          accelerator: 'Alt+F4',
          click(): void {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Server',
      submenu: [
        {
          label: 'New server',
          accelerator: 'Alt+N',
          click(): void {
            shortcutsHandler('add-server');
          }
        },
        {
          label: 'Information',
          accelerator: 'Alt+I',
          click(): void {
            shortcutsHandler('info-server');
          }
        },
        {
          label: 'Configuration',
          accelerator: 'Alt+C',
          click(): void {
            shortcutsHandler('config-server');
          }
        },
      ]
    },
    {
      label: 'Navigation',
      submenu: [
        {
          label: 'Back',
          accelerator: 'Esc',
          click(): void {
            shortcutsHandler('back');
          }
        },
        {
          label: 'Search',
          accelerator: 'CmdOrCtrl+Alt+S',
          click(): void {
            shortcutsHandler('toggle-search');
          }
        },
        {
          label: 'Toggle side menu',
          accelerator: 'CmdOrCtrl+Alt+T',
          click(): void {
            shortcutsHandler('toggle-menu');
          }
        },
        {
          type:'separator'
        },
        {
          label: 'Next tab',
          accelerator: 'CmdOrCtrl+RightArrow',
          click(): void {
            shortcutsHandler('next-tab');
          }
        },
        {
          label: 'Previous tab',
          accelerator: 'CmdOrCtrl+LeftArrow',
          click(): void {
            shortcutsHandler('previous-tab');
          }
        },
      ]
    },
    {
      label: 'Selection',
      submenu: [
        {
          label: 'Select all',
          accelerator: 'CmdOrCtrl+A',
          click(): void {
            shortcutsHandler('select-all');
          }
        },
        {
          label: 'Cancel selection',
          accelerator: 'CmdOrCtrl+Alt+C',
          click(): void {
            shortcutsHandler('clear-selection');
          }
        },
        {
          type:'separator'
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Report issue',
          click(): void {
            shell.openExternal("https://github.com/6c65726f79/Transmissionic/issues/new/choose");
          }
        },
        {
          label: 'About',
          accelerator: 'Alt+A',
          click(): void {
            shortcutsHandler('about');
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
