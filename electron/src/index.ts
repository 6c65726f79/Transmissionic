import type { CapacitorElectronConfig } from '@capacitor-community/electron';
import {
  getCapacitorElectronConfig,
  setupElectronDeepLinking,
} from '@capacitor-community/electron';
import { app, shell, ipcMain, net, Menu, BrowserWindow, dialog } from 'electron';
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
let openFiles: Array<string>;
let openMagnet: string;

// Graceful handling of unhandled errors.
unhandled();

// Get Config options from capacitor.config
const capacitorFileConfig: CapacitorElectronConfig =
  getCapacitorElectronConfig();

// Initialize our app. You can pass menu templates into the app here.
// const myCapacitorApp = new ElectronCapacitorApp(capacitorFileConfig);
const myCapacitorApp = new ElectronCapacitorApp(
  capacitorFileConfig,
  null,
  getMainMenu()
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
  if(process.argv.length>0){
    openFiles = getTorrents(process.argv);
    openMagnet = getMagnet(process.argv);
  }

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

    mainWindow = myCapacitorApp.getMainWindow();

    sendFilesOrMagnet();
  })();

  app.on('second-instance', (event, commandLine) => {
    openFiles = openFiles.concat(getTorrents(commandLine));
    openMagnet = getMagnet(commandLine);
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      sendFilesOrMagnet();
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

app.on('open-file', async (event, path) => {
  // Handle file opening on macOS
  openFiles.push(path);
  if(mainWindow) sendFilesOrMagnet();
})

app.on('open-url', async (event, url) => {
  // Handle magnet opening on macOS
  openMagnet=url;
  if(mainWindow) sendFilesOrMagnet();
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
app.on('activate', activate);


// Place all ipc or other electron api calls and custom functionality under this line
async function sendFilesOrMagnet() {
  if(!myCapacitorApp.getMainWindow().isDestroyed()){
    if(openFiles.length>0) mainWindow.webContents.isLoading() ? mainWindow.webContents.on('did-finish-load',sendFiles) : sendFiles();
    if(openMagnet!=null) mainWindow.webContents.send('magnet-open', openMagnet);
    openMagnet=null;
  }
  else {
    activate();
  }
}

const sendFiles = debounce(() => {
  const torrentFiles = loadTorrents();
  if(torrentFiles.length>0){
    mainWindow.webContents.send('file-open', torrentFiles);
  }
  openFiles=[];
});

function debounce(func: Function, timeout=500){
  let timer: NodeJS.Timeout;
  return (...args: Array<any>) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

async function activate() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (myCapacitorApp.getMainWindow().isDestroyed()) {
    await myCapacitorApp.init();
    mainWindow = myCapacitorApp.getMainWindow();
  }
}

function getTorrents(args: Array<string>): Array<string> {
  return args.filter(arg => arg && arg.toLowerCase().endsWith(".torrent"));
}

function loadTorrents() {
  const result: Array<Buffer> = [];
  openFiles.forEach(file => {
    result.push(fs.readFileSync(file))
  });
  return result;
}

function getMagnet(args: Array<any>): string {
  let result=null;
  args.forEach((arg: string) => {
    if(arg && arg.toLowerCase().startsWith("magnet:") && result==null){
      result = arg;
    }
  })
  return result;
}

const sendApplicationMenu = (webContents: Electron.WebContents): void => {
  let appMenu = Menu.getApplicationMenu();

  setDefaultRoleAccelerators(appMenu);

  // Strip functions, maps and circular references (for IPC)
  const menu = JSON.parse(JSON.stringify(appMenu, getCircularReplacer()));

  // Send menu structure to renderer
  webContents.send('application-menu', menu);
};

const getCircularReplacer = (): any => {
  const seen = new WeakSet();
  return (key, value) => {
    if (key === 'commandsMap') return;
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

const getMenuItemByCommandId = (commandId: number, menu = Menu.getApplicationMenu()) => {
  for (let i = 0; i < menu.items.length; i++) {
    const item = menu.items[i];
    if (item.commandId === commandId) {
      return item;
    } else if (item.submenu) {
      const result = getMenuItemByCommandId(commandId, item.submenu);
      if (result) {
        return result;
      }
    }
  }
};

const setDefaultRoleAccelerators = (menu: any): void => {
  for (let i = 0; i < menu.items.length; i++) {
    const item = menu.items[i];
    if (item.role && item.getDefaultRoleAccelerator) {
      item.defaultRoleAccelerator = item.getDefaultRoleAccelerator();
    }
    if (item.submenu) {
      setDefaultRoleAccelerators(item.submenu);
    }
    menu.items[i] = item;
  }
};

ipcMain.on('request-application-menu', (event) => sendApplicationMenu(event.sender));

ipcMain.on('menu-event', (event, commandId: number) => {
  getMenuItemByCommandId(commandId)?.click(undefined, BrowserWindow.fromWebContents(event.sender), event.sender);
});

ipcMain.on('window-event', (event, arg: string) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  switch (arg) {
    case 'minimize':
      window.minimize();
      break;
    case 'maximize':
      window.isMaximized() ? window.unmaximize() : window.maximize();
      break;
    case 'close':
      window.close();
      break;
  }
});

ipcMain.on('window-state', (event) => {
  event.returnValue = BrowserWindow.fromWebContents(event.sender).isMaximized();
});

ipcMain.handle('request', async (event, args: Record<string,any>) => {
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

function getMainMenu(): Electron.MenuItemConstructorOptions[] {
  return [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open torrent...',
          accelerator: 'Alt+T',
          registerAccelerator: false,
          click(): void {
            dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'], filters:[{name:'Torrent',extensions:['torrent']}] }).then(result=> {
              openFiles = result.filePaths;
              sendFiles();
            });
          }
        },
        {
          label: 'Open magnet',
          accelerator: 'Alt+M',
          registerAccelerator: false,
          click(): void {
            shortcutsHandler('add-magnet');
          }
        },
        {
          label: 'Open URL',
          accelerator: 'Alt+U',
          registerAccelerator: false,
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
          registerAccelerator: false,
          click(): void {
            shortcutsHandler('settings');
          }
        },
        {
          type:'separator'
        },
        {
          role:'quit'
        }
      ]
    },
    {
      label: 'Server',
      submenu: [
        {
          label: 'New server',
          accelerator: 'Alt+N',
          registerAccelerator: false,
          click(): void {
            shortcutsHandler('add-server');
          }
        },
        {
          label: 'Information',
          accelerator: 'Alt+I',
          registerAccelerator: false,
          click(): void {
            shortcutsHandler('info-server');
          }
        },
        {
          label: 'Configuration',
          accelerator: 'Alt+C',
          registerAccelerator: false,
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
          registerAccelerator: false,
          click(): void {
            shortcutsHandler('back');
          }
        },
        {
          label: 'Search',
          accelerator: 'CmdOrCtrl+Alt+S',
          registerAccelerator: false,
          click(): void {
            shortcutsHandler('toggle-search');
          }
        },
        {
          label: 'Toggle side menu',
          accelerator: 'CmdOrCtrl+Alt+T',
          registerAccelerator: false,
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
          registerAccelerator: false,
          click(): void {
            shortcutsHandler('next-tab');
          }
        },
        {
          label: 'Previous tab',
          accelerator: 'CmdOrCtrl+LeftArrow',
          registerAccelerator: false,
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
          registerAccelerator: false,
          click(): void {
            shortcutsHandler('select-all');
          }
        },
        {
          label: 'Cancel selection',
          accelerator: 'Escape',
          registerAccelerator: false,
          click(): void {
            shortcutsHandler('clear-selection');
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Report issue',
          accelerator: 'Alt+R',
          click(): void {
            shell.openExternal("https://github.com/6c65726f79/Transmissionic/issues/new/choose");
          }
        },
        {
          role:'toggleDevTools'
        },
        {
          label: 'About',
          accelerator: 'Alt+A',
          registerAccelerator: false,
          click(): void {
            shortcutsHandler('about');
          }
        }
      ]
    }
  ]
}
