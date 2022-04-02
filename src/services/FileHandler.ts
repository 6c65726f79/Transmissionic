import { 
  isPlatform,
  modalController
} from '@ionic/vue';
import router from '../router';
import parseTorrent from 'parse-torrent'
import AddTorrent from '../views/AddTorrent.vue'
import { Utils } from './Utils';
import { Emitter } from "./Emitter";
import { TransmissionRPC } from "./TransmissionRPC";
import { Capacitor } from '@capacitor/core'; 
import { App } from '@capacitor/app';

declare global {
  interface Window {
      fileOpen: any;
      magnetOpen: any;
  }
}

let currentFile: HTMLInputElement|null;
let torrentFiles: Array<ArrayBuffer> = [];

export const FileHandler = {
  listenFileOpen(): void {
    if(isPlatform("electron") && window.fileOpen){
      window.fileOpen.receive((files: Array<ArrayBuffer>) => {
        torrentFiles = files;
        this.filesLoaded();
      });
      window.magnetOpen.receive((magnet: string) => {
        this.readMagnet(magnet);
      });
    }
    else if(isPlatform("capacitor")){
      App.addListener('appUrlOpen', async (data: Record<string,any>) => {
        if(data.url.startsWith("magnet:")){
          this.readMagnet(data.url);
        }
        else {
          const src = Capacitor.convertFileSrc(data.url)
          this.loadFiles([src]);
        }
      })
    }
    document.body.addEventListener("dragover", (e) => e.preventDefault(), false);
    document.body.addEventListener("drop",(e) => this.handleFilesDrop(e), false);

    // Read hash from URL
    const hash = decodeURIComponent(window.location.hash.substring(1));
    hash.startsWith("url:") ? this.readURL(hash.substring(4)) : this.readHashOrMagnet(hash);
  },
  async inputFile(): Promise<void> {
    if(!currentFile){
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("id", "inputFile");
      input.setAttribute("multiple", "true");
      input.setAttribute("accept", isPlatform("ios") ? ".torrent" : "application/x-bittorrent");
      input.setAttribute("style", "display:none;");
      currentFile = document.body.appendChild(input);
      currentFile.addEventListener("change", (e) => this.handleFiles(e), false);
    }
    currentFile.click();
  },
  arrayBufferToBase64( buffer: ArrayBuffer ): string {
    let binary = '';
    const bytes = new Uint8Array( buffer );
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
  },
  handleFilesDrop(e: DragEvent): void {
    e.preventDefault();
    if(e.dataTransfer){
      if(e.dataTransfer.files.length>0){
        this.readFiles(e.dataTransfer.files);
      }
      else {
        const data = e.dataTransfer.getData("text/plain");
        this.readHashOrMagnet(data);
      }
      
    }
  },
  handleFiles(e: Event): void {
    const files = (e.target as HTMLInputElement).files;
    if(files){
      this.readFiles(files)
    }
  },
  async readFiles(files: FileList): Promise<void>{
    torrentFiles = [];
    for(const file of Array.from(files)){
      if(file.name.endsWith(".torrent") || file.name.endsWith(".bittorrent") || file.type=="application/x-bittorrent"){
        torrentFiles.push(await this.readFile(file));
      }
    }
    if(torrentFiles.length>0){
      this.filesLoaded();
    }
  },
  readFile(file: File): Promise<ArrayBuffer> {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        resolve(e.target.result);
      }
      reader.onerror = () => {
        reject();
      }
      reader.readAsArrayBuffer(file);
    });
  },
  async loadFiles(paths: Array<string>): Promise<void> {
    torrentFiles = [];
    for(const path of paths){
      torrentFiles.push(await this.loadFile(path));
    }
    this.filesLoaded();
  },
  loadFile(path: string): Promise<ArrayBuffer> {
    return fetch(path)
      .then((r) => r.arrayBuffer())
  },
  filesLoaded(): void {
    const files: Array<any> = [];
    torrentFiles.forEach((torrentFile) => {
      const buffer = Buffer.from(torrentFile);
      const data = this.parseBuffer(buffer);
      const torrent = this.arrayBufferToBase64(torrentFile);
      files.push({
        data,
        torrent
      });
    });
    torrentFiles = [];
    this.newTorrentModal(files,"file");
  },
  parseBuffer(buffer: ArrayBuffer): Record<string,any>|void {
    try {
      return parseTorrent(buffer)
    } catch (error: any) {
      Utils.responseToast(error.message);
    }
  },
  readHashOrMagnet(text: string): void {
    let hash = text;
    if(hash.match(/^\b[0-9a-fA-F]{40}\b$/)){
      hash = `magnet:?xt=urn:btih:${hash}`;
    }
    if(hash.match(/^magnet:\?xt=urn:btih:[0-9a-zA-Z]{32,}(&.+)?$/)){
      this.readMagnet(hash);
    }
  },
  readMagnet(magnet: string): void {
    try {
      const data=parseTorrent(magnet);
      this.newTorrentModal([{data,torrent:magnet}],"magnet");
    } catch (error: any) {
      Utils.responseToast(error.message);
    }
  },
  readURL(url: string): void {
    if(this.isValidUrl(url)){
      parseTorrent.remote(url, (err, parsedTorrent) => {
        const data = err ? {} : parsedTorrent;
        if(data) {
          this.newTorrentModal([{data,torrent:url}],"url");
        }
      })
    }
  },
  isValidUrl(str: string): boolean {
    let url;
    try {
      url = new URL(str);
    } catch (_) {
      return false;  
    }
    return url!=null;
  },
  newTorrentModal(files: Array<any>, type: string): void {
    router.isReady().then(async () => {
      const modal = await modalController
        .create({
          component: AddTorrent,
          componentProps: {
            files,
            type
          }
        })
      modal.onDidDismiss()
        .then(() => {
          window.location.hash="";
          currentFile?.remove();
          currentFile=null;
          Emitter.emit("refresh", false);
        })
      return modal.present();
    });
  },
  openExplorer(details: Record<string, any>): boolean{
    let isFile = false;
    let path = details.name;
    const dir = details.downloadDir;

    if(details.files.length===1){
      path = details.files[0].name
      isFile = true;
    }
    
    if(window.fileOpen){
      return window.fileOpen.open(this.pathMapping(dir),path,isFile);
    }
    return false;
  },
  pathMapping(path: string): string{
    const list = TransmissionRPC.pathMapping;
    let result = path
    for(const map in list){
      if(path.startsWith(map)){
        result = list[map] + path.substring(map.length)
      }
    }
    return result;
  }
}
