const { contextBridge,ipcRenderer,shell } = require('electron');
const { app, net, Menu, MenuItem } = require('electron').remote
const { Titlebar, Color } = require('custom-electron-titlebar');
const path = require('path');
let titleBar;
let request;
let shortcutsHandler;

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
  const menu = new Menu();

  menu.append(new MenuItem({
    label: 'File',
    submenu: [
      {
        label: 'Open torrent',
        accelerator: 'CmdOrCtrl+Alt+O',
        click() {
          shortcutsHandler('open-torrent');
        }
      },
      {
        label: 'Add server',
        accelerator: 'CmdOrCtrl+Alt+A',
        click() {
          shortcutsHandler('add-server');
        }
      },
      {
        type:'separator'
      },
      {
        label: 'Exit',
        click() {
          app.quit();
        }
      }
    ]
  }));

  menu.append(new MenuItem({
    label: 'Selection',
    submenu: [
      {
        label: 'Select all',
        accelerator: 'CmdOrCtrl+A',
        click() {
          shortcutsHandler('select-all');
        }
      },
      {
        label: 'Cancel selection',
        accelerator: 'CmdOrCtrl+Alt+C',
        click() {
          shortcutsHandler('clear-selection');
        }
      },
      {
        type:'separator'
      }
    ]
  }));

  menu.append(new MenuItem({
    label: 'Help',
    submenu: [
      {
        label: 'About',
        accelerator: 'CmdOrCtrl+Alt+H',
        click() {
          shortcutsHandler('about');
        }
      }
    ]
  }));

  titleBar.updateMenu(menu);
}