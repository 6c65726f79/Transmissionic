require('./rt/electron-rt');
//////////////////////////////
// User Defined Preload scripts below

import { ipcRenderer, contextBridge, shell} from 'electron';
import path from 'path';
import Titlebar from '@6c65726f79/custom-titlebar';
import { platform } from 'process';
import { exec } from 'child_process';

let shortcutsHandler: Function;
let titleBar: Titlebar;

contextBridge.exposeInMainWorld('Titlebar', {
  new: () => {
    titleBar = new Titlebar({
      platform,
      icon: '/assets/icon/favicon.png',
      height: platform == 'darwin' ? 22 : 30,
      hideControlsOnDarwin: true,
      backgroundUnfocusEffect: false,
      onMinimize: () => ipcRenderer.send('window-event', 'minimize'),
      onMaximize: () => ipcRenderer.send('window-event', 'maximize'),
      onClose: () => ipcRenderer.send('window-event', 'close'),
      isMaximized: () => ipcRenderer.sendSync('window-state'),
      menuItemClickHandler: (commandId) => ipcRenderer.send('menu-event', commandId)
    });
    ipcRenderer.send('request-application-menu');
  },
  updateBackground: (color) => {
    titleBar.updateOptions({backgroundColor:color});
  },
  shortcuts: (func) => {
    shortcutsHandler = (shortcut) => func(shortcut);
  }
})

contextBridge.exposeInMainWorld('fileOpen', {
  receive: (func) => {
    ipcRenderer.on("file-open", (event, ...args) => func(...args));
  },
  open: (dir: string,location: string,isFile: boolean) => {
    let fullpath = path.join(dir,location);
    if(dir.startsWith('smb://')){
      fullpath = fullpath.replace('smb:/','smb://'); // Fix on macOS
    }
    if(platform === 'darwin'){
      exec(isFile ? `open -a Finder "${fullpath}"` : `open "${fullpath}"`)
    }
    else {
      isFile ? shell.showItemInFolder(fullpath) : shell.openPath(fullpath);
    }
  }
})

contextBridge.exposeInMainWorld('magnetOpen', {
  receive: (func) => {
    ipcRenderer.on("magnet-open", (event, ...args) => func(...args));
  }
})

contextBridge.exposeInMainWorld('net', {
  request: async (options,data) => {
    return ipcRenderer.invoke('request', {options,data});
  }
})

ipcRenderer.on("shortcut", (event, shortcut: string) => {
  shortcutsHandler(shortcut);
})

ipcRenderer.on('application-menu', (event, appMenu) => {
  titleBar.updateMenu(appMenu);
});