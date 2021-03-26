import { Plugins, StatusBarStyle } from '@capacitor/core';
const { StatusBar,Toast } = Plugins;
import { isPlatform } from '@ionic/vue';
import { UserSettings } from "./UserSettings";
import { Locale } from "./Locale";
import Moment from "moment"

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
    if(bytes===undefined) return;
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

  getPercent(percentDone: number): string {
    return (percentDone*100).toLocaleString(UserSettings.getLanguage(), {maximumFractionDigits:2})+'%'
  },

  getRatio(ratio: number, decimal=3): string {
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

  async ipToCountry(ip: string): Promise<any>{
    const wait = (ipToCountryWaitUntil && Date.now() < ipToCountryWaitUntil)||false;
    const found = (ipToCountryList[ip]!=null);
    const limited = (ipToCountryLimit<=0);
    if(found && ipToCountryList[ip]!="loading"){
      return ipToCountryList[ip];
    }
    else if(!found && !limited && !wait) {
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

  actionStatusResult(action: string, percentDone: number): number{
    // Predict what will be the status of a torrent after an action
    switch (action) {
      case "start":
      case "start-now":
        return (percentDone==1) ? 6 : 4;
      case "verify":
        return 2;
      default:
        return 0;
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
    const text = result=="success" ? Locale.success : (result!="" ? result : Locale.error)
    await Toast.show({text});
  },

  // eslint-disable-next-line
  customScrollbar(el: any, shadowRoot=true, padding=true): void{
    if(el && isPlatform("desktop")){
      let content;
      if(el.$el){
        content = el.$el as Element;
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
      window.Titlebar.new()
    }
  },

  setStatusBarColor(isDark: boolean): void {
    const statusBarColor = getComputedStyle(document.body).getPropertyValue('--ion-toolbar-background') || getComputedStyle(document.body).getPropertyValue('--ion-color-light') // --ion-color-primary
    if(isPlatform("capacitor") && (isPlatform("android") ||  isPlatform("ios"))){
      StatusBar.setStyle({style: isDark ? StatusBarStyle.Dark : StatusBarStyle.Light});
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
  }
}