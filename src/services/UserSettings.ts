import { reactive } from 'vue'
import { isPlatform } from '@ionic/vue';
import { Preferences } from '@capacitor/preferences';
import { WSSecureStorage } from '@aparajita/capacitor-secure-storage';


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
  ipFlags:false,
  openMagnetLinks:false,
  searchByName:true,
  searchByDirectory:true,
  selectedPreset:"",
  rememberSelectedPreset:false,
  compactMode: false
}

const defaultServer: Record<string, any> = {
  name:"Default",
  host:window.location.hostname,
  port:window.location.port || ((window.location.protocol==="https:") ? 443 : 80),
  https:(window.location.protocol==="https:")
}

const defaultServers: Array<Record<string,any>> = [defaultServer];

export const UserSettings = {
  state: reactive({...defaultSettings}) as Record<string,any>,

  getLanguage(): string {
    return this.state.language=="default" ? navigator.language : this.state.language
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

    await this.loadDefaultSettings();

    for (const setting in this.state) {
      await Preferences.get({ key: setting })
        .then((val: Record<string,any>) => {
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

  async loadDefaultSettings(): Promise<void> {
    if(!isPlatform("capacitor") && !isPlatform("electron")){
      const defaultJson = await fetch('default.json')
        .then((response) => response.json())
        .catch(()=> {return})
      if(defaultJson){
        for (const setting in defaultJson) {
          if(setting=="servers"){
            defaultServers.length = 0;
            defaultJson[setting].forEach((server: Record<string,any>) => {
              defaultServers.push(Object.assign({}, defaultServer, server));
            });
          }
          else {
            this.setValue(setting,defaultJson[setting]);
            defaultSettings[setting]=defaultJson[setting];
          }
        }
      }
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
      Preferences.set({
        key: key,
        value: Object(this.state)[key].toString()
      });
    }
    else {
      Preferences.remove({key})
    }
  },

  async loadServerList(): Promise<Array<Record<string,unknown>>> {
    let result: Array<Record<string,unknown>> = [];

    if(!isPlatform("capacitor") && !isPlatform("electron")){
      result = [...defaultServers];
    }

    await WSSecureStorage.get("servers")
      .then((val: any) => {
        result = (val && val!="[]") ? JSON.parse(val.value) : result
      })
      .catch(()=>{return})
    
    return result;
  },

  saveServerList(serverList: Record<string, any>): void {
    WSSecureStorage.set("servers", JSON.stringify(serverList));
  },

  async loadPresets(): Promise<Record<string,any>> {
    let result: Record<string,any> = {};

    await Preferences.get({ key: "presets" })
      .then((val: Record<string,any>) => {
        if(val.value){
          result=JSON.parse(val.value);
        }
      });

    return result;
  },

  savePresets(presets: Record<string,any>): void {
    Preferences.set({
      key: "presets",
      value: JSON.stringify(presets)
    });
  }
}
