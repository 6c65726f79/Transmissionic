import { 
  isPlatform,
  modalController
} from '@ionic/vue';
import AddTorrent from '../views/AddTorrent.vue'
import { Emitter } from "./Emitter";
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
  listenFileOpen() {
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
  },
  async inputFile() {
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
  arrayBufferToBase64( buffer: ArrayBuffer ) {
    let binary = '';
    const bytes = new Uint8Array( buffer );
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
  },
  handleFileDrop(e: any) {
    e.preventDefault();
    if(e.dataTransfer.files.length>0){
      this.readFile(e.dataTransfer.files[0])
        .then((result) => {
          this.fileLoaded(result);
        })
    }
  },
  handleFile(e: any) {
    if(e.target.files.length>0){
      this.readFile(e.target.files[0])
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
  async loadFile(path: string) {
    const file = await fetch(path)
      .then((r) => r.arrayBuffer())
    if(file){
      this.fileLoaded(file)
    }
  },
  fileLoaded(content: ArrayBuffer) {
    const buffer = new Buffer(content);
    const torrentData = this.parseBuffer(buffer);
    if(torrentData!=null){
      const base64 = this.arrayBufferToBase64(content);
      this.newTorrentModal(torrentData,base64,"file");
    }
  },
  parseBuffer(buffer: ArrayBuffer) {
    try {
      return parseTorrent(buffer)
    } catch (error) {
      Utils.responseToast(error.message);
    }
  },
  readMagnet(magnet: string) {
    try {
      const torrentData=parseTorrent(magnet);
      this.newTorrentModal(torrentData,magnet,"magnet");
    } catch (error) {
      Utils.responseToast(error.message);
    }
  },
  readURL(url: string) {
    parseTorrent.remote(url, (err, parsedTorrent) => {
      if (err) {
        Utils.responseToast(err.message);
      }
      else if(parsedTorrent) {
        this.newTorrentModal(parsedTorrent,url,"url");
      }
    })
  },
  async newTorrentModal(torrentData: Record<string,any>, torrent: any, type: string) {
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
        currentFile?.remove();
        currentFile=null;
        Emitter.emit("refresh");
      })
    return modal.present();
  }
}