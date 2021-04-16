import { 
  isPlatform,
  modalController
} from '@ionic/vue';
import AddTorrent from '../views/AddTorrent.vue'
import { Emitter } from "./Emitter";
import { TransmissionRPC } from "./TransmissionRPC";
import { Capacitor,Plugins } from '@capacitor/core'; 
const { FileSelector,App } = Plugins; 
import parseTorrent from 'parse-torrent'
import { Utils } from './Utils';

declare const Buffer: any
declare global {
  interface Window {
      fileOpen: any;
  }
}

let currentFile: HTMLInputElement|null;

export const FileHandler = {
  listenFileOpen(): void {
    if(isPlatform("electron") && window.fileOpen){
      window.fileOpen.receive((arg: any) => {
        this.fileLoaded(arg)
      });
    }
    else if(isPlatform("capacitor")){
      App.addListener('appUrlOpen', async (data) => {
        if(data.url.startsWith("magnet:")){
          this.readMagnet(data.url);
        }
        else {
          const src = Capacitor.convertFileSrc(data.url)
          this.loadFile(src);
        }
      })
    }
    document.body.addEventListener("dragover", (e) => e.preventDefault(), false);
    document.body.addEventListener("drop",(e) => this.handleFileDrop(e), false);

    // Read hash from URL
    const hash = window.location.hash.substring(1)
    hash.startsWith("url:") ? this.readURL(hash.substring(4)) : this.readHashOrMagnet(hash);
  },
  async inputFile(): Promise<void> {
    if(isPlatform("capacitor") && (isPlatform("ios") || isPlatform("android"))){
      // Capacitor file chooser
      const selectedFile = await FileSelector.fileSelector({ 
        "multiple_selection": false, 
        ext: ["torrent"] 
      })

      if(isPlatform("android")){
        const paths = JSON.parse(selectedFile.paths) 
        if(paths.length>0){
          this.loadFile(paths[0]);
        }
      }
    }
    else {
      // Browser file chooser
      if(!currentFile){
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("id", "inputFile");
        input.setAttribute("multiple", "false");
        input.setAttribute("accept", ".torrent");
        input.setAttribute("style", "display:none;");
        currentFile = document.body.appendChild(input);
        currentFile.addEventListener("change", (e) => this.handleFile(e), false);
      }
      currentFile.click();
    }
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
  handleFileDrop(e: DragEvent): void {
    e.preventDefault();
    if(e.dataTransfer){
      if(e.dataTransfer.files.length>0){
        this.readFile(e.dataTransfer.files[0])
          .then((result) => {
            this.fileLoaded(result);
          })
      }
      else {
        const data = e.dataTransfer.getData("text/plain");
        this.readHashOrMagnet(data);
      }
      
    }
  },
  handleFile(e: Event): void {
    const files = (e.target as HTMLInputElement).files;
    if(files){
      this.readFile(files[0])
        .then((result) => {
          this.fileLoaded(result);
        })
    }
  },
  readFile(file: File): Promise<ArrayBuffer> {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        resolve(e.target.result)
      }
      reader.onerror = () => {
        reject();
      }
      reader.readAsArrayBuffer(file);
    });
  },
  async loadFile(path: string): Promise<void> {
    const file = await fetch(path)
      .then((r) => r.arrayBuffer())
    if(file){
      this.fileLoaded(file)
    }
  },
  fileLoaded(content: ArrayBuffer): void {
    const buffer = new Buffer(content);
    const torrentData = this.parseBuffer(buffer);
    if(torrentData!=null){
      const base64 = this.arrayBufferToBase64(content);
      this.newTorrentModal(torrentData,base64,"file");
    }
  },
  parseBuffer(buffer: ArrayBuffer): Record<string,any>|void {
    try {
      return parseTorrent(buffer)
    } catch (error) {
      Utils.responseToast(error.message);
    }
  },
  readHashOrMagnet(text: string): void {
    let hash = text;
    if(hash.match(/^\b[0-9a-fA-F]{40}\b$/)){
      hash = `magnet:?xt=urn:btih:${hash}`;
    }
    if(hash.match(/^magnet:\?xt=urn:btih:[0-9a-fA-F]{40}(&.+)?$/)){
      this.readMagnet(hash);
    }
  },
  readMagnet(magnet: string): void {
    try {
      const torrentData=parseTorrent(magnet);
      this.newTorrentModal(torrentData,magnet,"magnet");
    } catch (error) {
      Utils.responseToast(error.message);
    }
  },
  readURL(url: string): void {
    parseTorrent.remote(url, (err, parsedTorrent) => {
      if (err) {
        Utils.responseToast(err.message);
        this.newTorrentModal({},url,"url");
      }
      else if(parsedTorrent) {
        this.newTorrentModal(parsedTorrent,url,"url");
      }
    })
  },
  async newTorrentModal(torrentData: Record<string,any>|null, torrent: string, type: string): Promise<void> {
    const modal = await modalController
      .create({
        component: AddTorrent,
        componentProps: {
          data:torrentData,
          torrent:torrent,
          type:type
        }
      })
    modal.onDidDismiss()
      .then(() => {
        window.location.hash="";
        currentFile?.remove();
        currentFile=null;
        Emitter.emit("refresh");
      })
    return modal.present();
  },
  openExplorer(dir: string, path: string, isFile=false): void{
    window.fileOpen.open(this.pathMapping(dir),path,isFile);
  },
  pathMapping(path: string): string{
    const list = TransmissionRPC.pathMapping;
    let result = path
    for(const map in list){
      if(path.startsWith(map)){
        result = list[map] + path.substr(map.length)
      }
    }
    return result;
  }
}