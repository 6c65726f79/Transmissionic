import type { CapacitorElectronConfig } from '@capacitor-community/electron';
import {
  getCapacitorElectronConfig,
  setupElectronDeepLinking,
} from '@capacitor-community/electron';
import { app, shell, Menu, ipcMain } from 'electron';
//import { Menu } from '@electron/remote';
import fs from "fs";
import electronIsDev from 'electron-is-dev';
import unhandled from 'electron-unhandled';
import { autoUpdater } from 'electron-updater';

import {
  ElectronCapacitorApp,
  setupContentSecurityPolicy,
  setupReloadWatcher,
} from './setup';

let mainWindow;

// Graceful handling of unhandled errors.
unhandled();

// Get Config options from capacitor.config
const capacitorFileConfig: CapacitorElectronConfig =
  getCapacitorElectronConfig();

// Initialize our app. You can pass menu templates into the app here.
// const myCapacitorApp = new ElectronCapacitorApp(capacitorFileConfig);
const myCapacitorApp = new ElectronCapacitorApp(
  capacitorFileConfig
  //trayMenuTemplate,
  //appMenuBarMenuTemplate,
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

// Run Application
(async () => {
  // Wait for electron app to be ready.
  await app.whenReady();
  // Security - Set Content-Security-Policy based on whether or not we are in dev mode.
  setupContentSecurityPolicy(myCapacitorApp.getCustomURLScheme());
  // Initialize our app, build windows, and load content.
  await myCapacitorApp.init();
  // Check for updates if we are in a packaged app.
  autoUpdater.checkForUpdatesAndNotify();

  setMainMenu();

  mainWindow = myCapacitorApp.getMainWindow();
})();

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
