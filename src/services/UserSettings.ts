import { reactive } from 'vue'
import { isPlatform } from '@ionic/vue';
import 'capacitor-secure-storage-plugin';
import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;
const { SecureStoragePlugin } = Plugins;

export const UserSettings = {
  state: reactive({
    colorScheme:"default",
    language:"default",
    refreshInterval:5,
    timeout:5,
    orderBy:"addedDate",
    reverse:true,
    selectedServer:0,
    useBits:true,
    expandMenu:true,
    ipFlags:false
  }) as Record<string,any>,

  getLanguage() {
    return this.state.language=="default" ? navigator.language.substr(0,2) : this.state.language
  },

  setValue(key: string, val: any) {
    if(val!=null){
      Object(this.state)[key] = val;
    }
  },

  async loadSettings() {
    for (const setting in this.state) {
      await Storage.get({ key: setting })
        .then((val) => {
          if(val.value){
            if(typeof Object(this.state)[setting]=="boolean"){
              this.setValue(setting,(val.value=="true"));
            }
            else if(typeof Object(this.state)[setting]=="number"){
              this.setValue(setting,parseInt(val.value));
            }
            else {
              this.setValue(setting,val.value);
            }
          }
        });
    }
  },

  saveSettings() {
    for (const setting in this.state) {
      Storage.set({
        key: setting,
        value: Object(this.state)[setting].toString()
      });
    }
  },

  async loadServerList(): Promise<any> {
    let result;
    let defaultServer: Array<any> = [];

    if(!isPlatform("capacitor") && !isPlatform("electron")){
      defaultServer = [
        {
          name:"Default",
          host:window.location.hostname,
          port:window.location.port,
          https:(window.location.protocol==="https:")
        }
      ]
    }

    await SecureStoragePlugin.get({ key: "servers" })
      .then((val: any) => {
        result = (val.value && val.value!="[]") ? JSON.parse(val.value) : defaultServer
      })
      .catch(() => {
        result = defaultServer
      })

    return result;
  },

  saveServerList(serverList: Record<string, any>) {
    SecureStoragePlugin.set({
      key: "servers",
      value: JSON.stringify(serverList)
    });
  }
}