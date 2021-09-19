import { ipcRenderer, contextBridge } from 'electron';

////////////////////////////////////////////////////////
// eslint-disable-next-line @typescript-eslint/no-var-requires
const plugins = require('./electron-plugins');

const contextApi: {
  [plugin: string]: { [functionName: string]: () => Promise<any> };
} = {};
for (const pluginKey of Object.keys(plugins)) {
  for (const classKey of Object.keys(plugins[pluginKey]).filter(
    className => className !== 'default',
  )) {
    const functionList = Object.getOwnPropertyNames(
      plugins[pluginKey][classKey].prototype,
    ).filter(v => v !== 'constructor');
    if (!contextApi[classKey]) {
      contextApi[classKey] = {};
    }
    for (const functionName of functionList) {
      if (!contextApi[classKey][functionName]) {
        contextApi[classKey][functionName] = (...args) =>
          ipcRenderer.invoke(`${classKey}-${functionName}`, ...args);
      }
    }
  }
}
contextBridge.exposeInMainWorld('CapacitorCustomPlatform', {
  name: 'electron',
  plugins: contextApi,
});
////////////////////////////////////////////////////////
