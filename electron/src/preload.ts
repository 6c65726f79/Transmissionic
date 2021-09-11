require('./rt/electron-rt');
//////////////////////////////
// User Defined Preload scripts below

import { ipcRenderer, contextBridge, shell} from 'electron';
import { app, net, Menu } from '@electron/remote';
import { Titlebar, Color } from 'custom-electron-titlebar';
import path from 'path';
let titleBar: Titlebar;
let request: Electron.ClientRequest;
let shortcutsHandler: Function;

contextBridge.exposeInMainWorld('Titlebar', {
  new: () => {
    titleBar = new Titlebar({
      backgroundColor: Color.fromHex('#fff'),
      unfocusEffect:false
    });
    setMainMenu();
  },
  updateBackground: (color) => {
    titleBar.updateBackground(Color.fromHex(color))
  },
  shortcuts: (func) => {
    shortcutsHandler = (shortcut) => func(shortcut);
  }
})
contextBridge.exposeInMainWorld('fileOpen', {
  receive: (func) => {
    ipcRenderer.on("file-open", (event, ...args) => func(...args));
  },
  open: (dir,location,isFile) => {
    const fullpath = path.join(dir,location);
    (isFile) ? shell.showItemInFolder(fullpath) : shell.openPath(fullpath)
  }
})

contextBridge.exposeInMainWorld('magnetOpen', {
  receive: (func) => {
    ipcRenderer.on("magnet-open", (event, ...args) => func(...args));
  }
})

contextBridge.exposeInMainWorld('net', {
  request: async (options,data) => {
    return new Promise(function (resolve, reject) {
      let result;
      request = net.request(options)
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
      request.write(JSON.stringify(data))
      request.end()
      const timeout = setTimeout(() => {
        request.abort()
      },options.timeout*1000)
    });
  }
})

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

  const menu = Menu.buildFromTemplate(template)

  titleBar.updateMenu(menu);
}