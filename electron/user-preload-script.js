const { contextBridge,ipcRenderer,shell } = require('electron');
const { net } = require('electron').remote
const { Titlebar, Color } = require('custom-electron-titlebar');
const path = require('path');
let titleBar;
let request;

contextBridge.exposeInMainWorld('Titlebar', {
  new: () => {
    titleBar = new Titlebar({
      backgroundColor: Color.fromHex('#fff'),
      unfocusEffect:false
    })
  },
  updateBackground: (color) => {
    titleBar.updateBackground(Color.fromHex(color))
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
        let data="";
        result={
          headers:response.headers,
          status:response.statusCode
        };

        response.on('end', () => {
          clearTimeout(timeout)
          if(data!="" && response.statusCode==200){
            result.data = JSON.parse(data);
          }
          resolve(result)
        })

        response.on('error', (error) => {
          reject(error.message);
        })

        response.on('data', (chunk) => {
          data += chunk.toString()
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
