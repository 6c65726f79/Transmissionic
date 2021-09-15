require('./rt/electron-rt');
//////////////////////////////
// User Defined Preload scripts below

import { ipcRenderer, contextBridge, shell} from 'electron';
import path from 'path';
let shortcutsHandler: Function;

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