import {
  isPlatform,
  modalController,
  alertController,
  popoverController,
  actionSheetController,
  menuController,
  useBackButton
} from '@ionic/vue';
import { App } from '@capacitor/app';
import { Clipboard } from '@capacitor/clipboard';
import { Toast } from '@capacitor/toast';
import { ScreenReader } from '@capacitor/screen-reader';
import { StatusBar, Style } from '@capacitor/status-bar';
import { UserSettings } from "./UserSettings";
import { Locale } from "./Locale";
import Autolinker from 'autolinker';
import Moment from "moment";
import { Shortcuts } from './Shortcuts';
import { Emitter } from './Emitter';

declare global {
  interface Window {
      Titlebar: any;
  }
}

const ipToCountryList: Record<string,any> = {};
let ipToCountryLimit = 45;
let ipToCountryWaitUntil: any;

export const Utils = {
  formatBytes(bytes: number, decimals = 2, speed = false): string|void{
    if(bytes===undefined||bytes<0) return;
    const useSpeed = speed && UserSettings.state.useBits;
    const k = useSpeed ? 1000 : 1024;
    let unit = useSpeed ? Locale.units.bit : Locale.units.byte;
    if(speed){
      unit += Locale.units.perSecond
    }
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
    
    if (bytes === 0) return '0 ' + unit;

    const val = (useSpeed) ? bytes*8 : bytes
    const i = Math.floor(Math.log(val) / Math.log(k));

    return (val / Math.pow(k, i)).toLocaleString(UserSettings.getLanguage(), {maximumFractionDigits:dm}) + ' ' + sizes[i] + unit;
  },

  getPercent(percentDone=0): string {
    return (percentDone*100).toLocaleString(UserSettings.getLanguage(), {maximumFractionDigits:2})+'%'
  },

  getRatio(ratio=0, decimal=3): string {
    return ratio.toLocaleString(UserSettings.getLanguage(), {maximumFractionDigits:decimal});
  },

  durationToString(seconds: number): string{
    if(seconds<0) return "∞";
    Moment.locale(UserSettings.getLanguage())
    const duration = Moment.duration(seconds)
    return duration.humanize();
  },

  secondsToDate(seconds: number, timeSince=false, hourOnly=false): string{
    if(seconds === 0) return Locale.never;
    Moment.locale(UserSettings.getLanguage())
    const data = Moment(seconds*1000);
    let result = data.format(hourOnly && data.isSame(Date.now(), 'day') ? 'LT' : 'L LT');
    if(timeSince){
      result += " (" + this.timeSince(seconds) + ")";
    }
    return result
  },

  timeSince(seconds: number): string{
    Moment.locale(UserSettings.getLanguage())
    const since = Moment.duration(Date.now()-seconds*1000);
    return Locale.formatString(Locale.ago,since.humanize()) as string;
  },

  autoLink(unsafe: string): string {
    return Autolinker.link(unsafe,{
      stripPrefix:false,
      stripTrailingSlash:false,
      sanitizeHtml:true
    })
  },

  async clipboardCopy(text: string): Promise<any> {
    let promise;
    if(isPlatform("capacitor")){
      promise = Clipboard.write({string: text})
    }
    else if(navigator.clipboard && navigator.clipboard.writeText) {
      promise = navigator.clipboard.writeText(text)
    }
    else {
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.value = text;
      input.focus();
      input.select();
      const result = document.execCommand('copy');
      input.remove();
      if (!result) {
        throw Error('Failed to copy text.')
      }
    }
    return promise;
  },

  async ipToCountry(ip: string): Promise<any>{
    const wait = (ipToCountryWaitUntil && Date.now() < ipToCountryWaitUntil)||false;
    const found = (ipToCountryList[ip]!=null);
    const limited = (ipToCountryLimit<=0);
    if(found && ipToCountryList[ip]!="loading"){
      return ipToCountryList[ip];
    }
    else if(!found && (!limited || !wait)) {
      ipToCountryLimit--;
      ipToCountryList[ip]="loading";
      ipToCountryWaitUntil=undefined;
      ipToCountryList[ip] = await fetch('http://ip-api.com/json/'+ip+'?fields=16387&lang='+UserSettings.getLanguage())
        .then(this.readIpApi)

      if(ipToCountryList[ip]==null){
        ipToCountryWaitUntil = Date.now() + 60000;
      }
      else {
        return ipToCountryList[ip];
      }
    }
    
  },

  async readIpApi(response: Record<string,any>): Promise<any> {
    // Read the number of requests remaining in the current rate limit window
    const limit = response.headers.get('X-Rl');
    ipToCountryLimit = limit ? parseInt(limit) : ipToCountryLimit;
    if(ipToCountryLimit==0){
      const wait = response.headers.get('X-Ttl');
      ipToCountryWaitUntil = wait ? Date.now() + parseInt(wait)*1000 : Date.now() + 60000
    }

    if(response.ok){
      const details = await response.json();
      if(details.status=="success"){
        return details;
      }
    }
  },

  trackerDomain(host: string): Record<string,any>{
    let result={};
    //eslint-disable-next-line
    const regex = /^([\w]+):\/\/([\w\d\.-]+):?(\d+)?/;
    const matchs = host.match(regex);
    if(matchs){
      result = {
        protocol:matchs[1],
        domain:matchs[2],
        port:matchs[3] || 80
      }
    }
    return result;
  },

  actionStatusResult(action: string, current: number, percentDone: number): number{
    // Predict what will be the status of a torrent after an action
    switch (action) {
      case "start":
      case "start-now":
        return (percentDone==1) ? 6 : 4;
      case "verify":
        return 2;
      case "stop":
        return 0;
      default:
        return current;
    }
  },

  setTheme(theme: string): void {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches || window.navigator.userAgent.includes('AndroidDarkMode');
    let dark: boolean;
    switch (theme) {
      case "light":
        dark=false;
        break;
      case "dark":
        dark=true;
        break;
      default:
        dark=prefersDark
        break;
    }
    document.body.classList.toggle('dark', dark);
    this.setStatusBarColor(dark);
  },

  async responseToast(result: string): Promise<void> {
    let text;
    switch (result) {
      case "success":
        text = Locale.success
        break;
      case "":
        text = Locale.error
        break;
      default:
        text = result
        break;
    }
    await Toast.show({text});
    try {
      if(await ScreenReader.isEnabled()){
        await ScreenReader.speak({ value: text, language: UserSettings.getLanguage() });
      }
    } catch (e) {
      return;
    }
  },

  customScrollbar(el: unknown, shadowRoot=true, padding=true): void{
    if(el && isPlatform("desktop")){
      let content;
      if((el as any).$el){
        content = (el as any).$el as Element;
      }
      else{
        content = el as Element;
      }
      const styles = document.createElement('style');

      styles.textContent = `
      ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
      }

      ::-webkit-scrollbar-track {
          background:transparent;
      }

      ::-webkit-scrollbar-thumb {
          background:rgba(127,127,127,.2);
          border-radius:3px;
      }

      ::-webkit-scrollbar-thumb:hover {
          background:rgba(127,127,127,.5);
      }
      `;

      if(padding){
          styles.textContent+= `
          ::-webkit-scrollbar-button:increment {
            height:var(--offset-bottom);
          }

          ::-webkit-scrollbar-button:decrement {
              height:var(--offset-top);
          }
          `;
      }
      
      if(shadowRoot && content.shadowRoot){
        content.shadowRoot.appendChild(styles);
      }
      else {
        content.appendChild(styles);
      }
    }
  },

  customTitlebar(): void {
    if(window.Titlebar){
      window.Titlebar.new();

      window.Titlebar.shortcuts((shortcut: string) => {
        Shortcuts.call(shortcut);
      });
    }
  },

  setStatusBarColor(isDark: boolean): void {
    const statusBarColor = getComputedStyle(document.body).getPropertyValue('--ion-toolbar-background') || getComputedStyle(document.body).getPropertyValue('--ion-color-light') // --ion-color-primary
    if(isPlatform("capacitor") && (isPlatform("android") ||  isPlatform("ios"))){
      StatusBar.setStyle({style: isDark ? Style.Dark : Style.Light});
      StatusBar.setBackgroundColor({color:statusBarColor});
    }
    else if(isPlatform("electron")){
      if(window.Titlebar){
        window.Titlebar.updateBackground(statusBarColor)
      }
    }
  },

  customDirectives(app: Record<string, any>): void {
    app.directive('longpress', {
      beforeMount(el: any, binding: any) {
        let pressTimer: any = null
        
        const handler = () => {
          binding.value(parseInt(el.getAttribute("attr-id")))
        }
    
        const start = (e: any) => {
            if (e.type === 'click' && e.button !== 0) {
                return;
            }
            if (pressTimer === null) {
                binding.value(); // Init fallback
                pressTimer = setTimeout(() => {
                    handler()
                }, 600)
            }
        }
    
        const cancel = () => {
            if (pressTimer !== null) {
                clearTimeout(pressTimer)
                pressTimer = null
            }
        }
    
        el.addEventListener("mousedown", start);
        el.addEventListener("touchstart", start, {passive: true});
        el.addEventListener("click", cancel);
        el.addEventListener("mouseout", cancel);
        el.addEventListener("mouseup", cancel);
        el.addEventListener("touchend", cancel);
        el.addEventListener("touchcancel", cancel);
        el.addEventListener("touchmove", cancel, {passive: true});
      }
    })
  },

  backButtonHandle(): void {
    Emitter.on('back', () => { this.popState() });

    if(isPlatform('capacitor')){
      useBackButton(-1, async () => {
        const top = await this.getTop();
        if(!top.hasTop){
          App.exitApp();
        }
      });
    }
    else {
      window.addEventListener('popstate', (e: any) => {
        if (e.origin && e.origin !== window.location.origin)
          return;

        this.popState(e)
      });
    }
  },
  async popState(e: Event|null=null): Promise<void> {
    const top = await this.getTop();
    if(top.hasTop){
      e?.preventDefault();
      history.go(1);
    }
    if(top.actionsheet){
      top.actionsheet.dismiss();
    }
    else if(top.popover){
      top.popover.dismiss();
    }
    else if(top.alert){
      top.alert.dismiss();
    }
    else if(top.modal){
      top.modal.dismiss();
    }
    else if(top.menu){
      menuController.close();
    }
  },
  pushState(): void {
    if (!window.history.state.modal) {
      const modalState = { modal: true };
      history.pushState(modalState, "");
    }
  },
  async getTop(): Promise<Record<string,any>> {
    const menu = await menuController.isOpen();
    const modal = await modalController.getTop();
    const alert = await alertController.getTop();
    const popover = await popoverController.getTop();
    const actionsheet = await actionSheetController.getTop();
    return {
      menu,
      modal,
      alert,
      popover,
      actionsheet,
      hasTop:(menu || modal || alert || popover || actionsheet)
    }
  },
  async loadAppleTouchIcon(): Promise<void> {
    // Workaround to prevent authentication error on iOS, see https://trac.transmissionbt.com/ticket/5329
    const data: string = await fetch("./assets/icon/apple-touch-icon.png")
      .then(response => response.blob())
      .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      }))
    document.querySelector("link[title=ATI]")?.setAttribute("href",data);
  }
}
