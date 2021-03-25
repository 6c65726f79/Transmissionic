import { reactive } from 'vue'
import { isPlatform } from '@ionic/vue';
import 'capacitor-secure-storage-plugin';
import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;
const { SecureStoragePlugin } = Plugins;

const defaultSettings: Record<string,any> = {
  colorScheme:"default",
  language:"default",
  refreshInterval:5,
  timeout:10,
  orderBy:"addedDate",
  reverse:true,
  selectedServer:0,
  useBits:true,
  expandMenu:true,
  ipFlags:false
}

export const UserSettings = {
  state: reactive({...defaultSettings}) as Record<string,any>,

  getLanguage(): string {
    return this.state.language=="default" ? navigator.language.substr(0,2) : this.state.language
  },

  setValue(key: string, val: string|number|boolean|unknown, save=false): void {
    if(val!=null){
      Object(this.state)[key] = val;
    }
    if(save){
      this.saveKey(key);
    }
  },

  async loadSettings(): Promise<void> {

    if(!isPlatform("capacitor") && !isPlatform("electron")){
      const defaultJson = await fetch('default.json')
        .then((response) => response.json())
        .catch(()=> {return})
      if(defaultJson){
        for (const setting in defaultJson) {
          this.setValue(setting,defaultJson[setting])
          defaultSettings[setting]=defaultJson[setting];
        }
      }
    }

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

  resetSettings(): void {
    for (const setting in this.state) {
      this.setValue(setting,defaultSettings[setting],true);
    }
  },

  saveSettings(): void {
    for (const setting in this.state) {
      this.saveKey(setting);
    }
  },

  saveKey(key: string): void {
    if(this.state[key] != defaultSettings[key] || key=="selectedServer"){
      Storage.set({
        key: key,
        value: Object(this.state)[key].toString()
      });
    }
    else {
      Storage.remove({key})
    }
  },

  async loadServerList(): Promise<Array<Record<string,unknown>>> {
    let result: Array<Record<string,unknown>> = [];

    if(!isPlatform("capacitor") && !isPlatform("electron")){
      result = [
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
        result = (val.value && val.value!="[]") ? JSON.parse(val.value) : result
      })
      .catch(()=>{return})
    
    return result;
  },

  saveServerList(serverList: Record<string, any>): void {
    SecureStoragePlugin.set({
      key: "servers",
      value: JSON.stringify(serverList)
    });
  }
}