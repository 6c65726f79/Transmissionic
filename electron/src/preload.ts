require('./rt/electron-rt');
//////////////////////////////
// User Defined Preload scripts below

import { ipcRenderer, contextBridge, shell} from 'electron';
import path from 'path';
import Titlebar from '@6c65726f79/custom-titlebar';
const { Menu, getCurrentWindow } = require('@electron/remote')
let shortcutsHandler: Function;
let titleBar: Titlebar;

const currentWindow = getCurrentWindow();

contextBridge.exposeInMainWorld('Titlebar', {
  new: () => {
    titleBar = new Titlebar({
      menu:Menu.getApplicationMenu(),
      onMinimize:() => currentWindow.minimize(),
      onMaximize:() => currentWindow.isMaximized() ? currentWindow.unmaximize() : currentWindow.maximize(),
      onClose:() => currentWindow.close(),
      isMaximized: () => currentWindow.isMaximized()
    });
  },
  updateBackground: (color) => {
    titleBar.updateBackground(color);
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
    return ipcRenderer.invoke('request', {options,data});
  }
})

ipcRenderer.on("shortcut", (event, shortcut: string) => {
  shortcutsHandler(shortcut);
})