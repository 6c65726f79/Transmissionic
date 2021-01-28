<template>
  <ion-page>

    <ion-header :translucent="true">
      <ion-toolbar>
        <template v-if="!privateState.viewSearch">
          <ion-buttons slot="start">
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
          <ion-title id="logo">
            Transmiss<span>ionic</span>
          </ion-title>
          <ion-buttons slot="end">
            <ion-button @click="openSearch()" fill="clear">
              <ion-icon slot="icon-only" :ios="searchOutline" :md="searchSharp"></ion-icon>
            </ion-button>
          </ion-buttons>
        </template>
        <template v-if="privateState.viewSearch">
          <ion-searchbar id="search" show-cancel-button="always" v-model="privateState.search" @ionCancel="privateState.viewSearch=false" :placeholder="Locale.search" :cancel-button-text="Locale.actions.cancel"></ion-searchbar>
        </template>
      </ion-toolbar>
    </ion-header>

    <ConnectionStatus
      v-if="!connectionStatus.connected"
      v-on:retry="retry()">
    </ConnectionStatus>

    <VirtualScroll v-else id="torrentList" :fullscreen="true" :items="torrentOrderedList" :item-size="72" key-field="id">
      <template v-slot:start>
        <ion-list-header id="top">
          <ion-label>
            {{torrentSelectedList.length}}
            {{torrentSelectedList.length > 1 ? Locale.torrent.other : Locale.torrent.one }} ·
            <span @click="openOrderPopover">
              <ion-icon :ios="filterOutline" :md="filterSharp"></ion-icon>
              {{ Locale.order }}
            </span>
          </ion-label>
        </ion-list-header>
      </template>

      <template v-slot:default="{item}">
        <Torrent 
          v-if="!item.deleted"
          :attr-id="item.id"
          :torrent="item" 
          v-on:switch="switchTorrentState"
          @click="torrentClick(item)" 
          @contextmenu="longPress($event,item.id)" 
          v-longpress="longPressFallback"
          :class="{ selected: privateState.selection.includes(item.id) }">
        </Torrent>
      </template>

      <!-- Text to display if the list is empty -->
      <template v-slot:search v-if="privateState.search!=''">
        {{ Locale.noResult }}
      </template>

      <template v-slot:fab>
        <ion-fab vertical="bottom" horizontal="end" slot="fixed">
          <ion-fab-button>
            <ion-icon :icon="add"></ion-icon>
          </ion-fab-button>
          <ion-fab-list side="top">
            <ion-fab-button color="light" :data-desc="Locale.torrentFile" @click="inputFile()">
              <ion-icon :ios="documentOutline" :md="documentSharp"></ion-icon>
            </ion-fab-button>
            <ion-fab-button color="light" :data-desc="Locale.magnet" @click="inputLink('magnet')">
              <ion-icon :ios="magnetOutline" :md="magnetSharp"></ion-icon>
            </ion-fab-button>
            <!--<ion-fab-button color="light" data-desc="URL" @click="inputLink('url')">
              <ion-icon :ios="ionicons.linkOutline" :md="ionicons.linkSharp"></ion-icon>
            </ion-fab-button>-->
          </ion-fab-list>
        </ion-fab>
      </template>
    </VirtualScroll>

    <ion-footer v-if="connectionStatus.connected" :translucent="true">
      <ion-toolbar v-if="privateState.selection.length>0" id="footer" color="primary">
        <ion-buttons slot="start">
          <ion-button fill="clear" @click="cancelSelection()">
            <ion-icon slot="icon-only" :ios="closeOutline" :md="closeSharp"></ion-icon>
          </ion-button>
        </ion-buttons>
        <div class="text">
          {{ privateState.selection.length }} {{ privateState.selection.length>1 ? Locale.selected.other : Locale.selected.one }}
        </div>
        <ion-buttons slot="end">
          <ion-button fill="clear" @click="torrentActions(privateState.selection[0])">
            <ion-icon slot="icon-only" :ios="ellipsisVerticalOutline" :md="ellipsisVerticalSharp"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      <ion-toolbar v-else id="footer">
        <ion-buttons slot="start">
          <!-- TODO : Add server configuration modal
          <ion-button fill="clear">
            <ion-icon slot="icon-only" :ios="ionicons.constructOutline" :md="ionicons.constructSharp"></ion-icon>
          </ion-button>-->
          <ion-button fill="clear" @click="switchAltSpeed()">
            <ion-icon 
              slot="icon-only"
              :color="privateState.altSpeedEnabled ? 'primary' : null"
              :ios="privateState.altSpeedEnabled ? speedometer : speedometerOutline"
              :md="speedometerSharp">
            </ion-icon>
          </ion-button>
          <ion-button fill="clear" @click="serverInformations()">
            <ion-icon slot="icon-only" :ios="informationCircleOutline" :md="informationCircleSharp"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <span class="bloc">
            <ion-icon :icon="arrowDownOutline" color="success"></ion-icon> {{ Utils.formatBytes(downloadSpeed,2,true) }}
          </span>
          <span class="bloc">
            <ion-icon :icon="arrowUpOutline" color="primary"></ion-icon> {{ Utils.formatBytes(uploadSpeed,2,true) }}
          </span>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>

  </ion-page>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';
import { 
  isPlatform,
  modalController,
  popoverController,
  actionSheetController,
  alertController,
  IonButtons, 
  IonHeader, 
  IonMenuButton, 
  IonPage,
  IonTitle, 
  IonToolbar,
  IonIcon,
  IonButton,
  IonSearchbar,
  IonFooter,
  IonFab, 
  IonFabButton, 
  IonFabList,
  IonLabel,
  IonListHeader
} from '@ionic/vue';
import {
  searchOutline,
  searchSharp,
  filterOutline,
  filterSharp,
  add,
  documentOutline,
  documentSharp,
  magnetOutline,
  magnetSharp,
  closeOutline,
  closeSharp,
  ellipsisVerticalOutline,
  ellipsisVerticalSharp,
  speedometer,
  speedometerOutline,
  speedometerSharp,
  informationCircleOutline,
  informationCircleSharp,
  arrowDownOutline,
  arrowUpOutline
} from 'ionicons/icons';
import ConnectionStatus from './components/ConnectionStatus.vue';
import TorrentDetails from './TorrentDetails.vue'
import VirtualScroll from './components/VirtualScroll.vue'
import Torrent from './components/Torrent.vue'
import OrderPopover from './components/OrderPopover.vue'
import { TransmissionRPC } from "../services/TransmissionRPC";
import { UserSettings } from "../services/UserSettings";
import { FileHandler } from "../services/FileHandler";
import { Locale } from "../services/Locale";
import { Utils } from "../services/Utils";
import { Emitter } from "../services/Emitter";
import * as _ from 'lodash';

export default defineComponent({
  name: 'list',
  data() {
    return {
      torrentList:[] as any,
      filter:"",
      filterIds:[] as number[],
      sharedState: UserSettings.state,
      privateState: {
        viewSearch:false,
        search:"",
        viewPopover:false,
        needFallback:false,
        selection: [] as number[],
        altSpeedEnabled:false
      }
    }
  },
  inject: ['connectionStatus','serverCount'],
  components: {
    ConnectionStatus,
    VirtualScroll,
    Torrent,
    IonButtons,
    IonHeader,
    IonMenuButton,
    IonPage,
    IonTitle,
    IonToolbar,
    IonIcon,
    IonButton,
    IonSearchbar,
    IonFooter,
    IonFab, 
    IonFabButton,
    IonFabList,
    IonLabel,
    IonListHeader
  },
  computed: {
    torrentSelectedList: function(): Array<any> {
      let result: Array<any>;
      let list = this.torrentList;
      const selection = this.privateState.selection;

      if(this.filterIds.length>0){
        list = _.filter(list, (o) => {
          return this.filterIds.includes(o.id)
        });
      }
      
      switch (this.filter) {
        case "downloading":
          result = _.filter(list, function(o) {
            return o.status == 4
          });
          break;
        case "seeding":
          result = _.filter(list, function(o) {
            return o.status == 6
          });
          break;
        case "active":
          result = _.filter(list, function(o) {
            return o.activityDate*1000 > Date.now()-60000;
          });
          break;
        case "completed":
          result = _.filter(list, function(o) {
            return o.percentDone == 1;
          });
          break;
        case "stopped":
          result = _.filter(list, function(o) {
            return o.status == 0;
          });
          break;
        case "error":
          result = _.filter(list, function(o) {
            return o.errorString != "";
          });
          break;
        case "queued":
          result = _.filter(list, function(o) {
            return o.status == 3;
          });
          break;
        case "selected":
          result = _.filter(list, function(o) {
            return selection.includes(o.id);
          });
          break;
        default:
          result = list;
          break;
      }

      if(this.privateState.search!=""){
        const search=this.privateState.search;
        result = _.filter(result, function(o) {
          return o.name.toLowerCase().indexOf(search.toLowerCase()) >= 0;
        });
      }

      return result
    },
    torrentOrderedList: function (): Array<any> {
      const orders = [this.sharedState.reverse ? 'desc' : 'asc'] as Array<any>;
      if(this.sharedState.orderBy=="name"){
        return _.orderBy(this.torrentSelectedList, [torrent => torrent.name.toString().toLowerCase()], orders);
      }
      else {
        return _.orderBy(this.torrentSelectedList, [this.sharedState.orderBy], orders);
      }
    },
    uploadSpeed: function (): number {
      return _.sumBy(this.torrentList, function(o: Record<string,any>) { return o.rateUpload; });
    },
    downloadSpeed: function (): number {
      return _.sumBy(this.torrentList, function(o: Record<string,any>) { return o.rateDownload; });
    }
  },
  setup() {
    return { 
      Locale,
      Utils,
      searchOutline,
      searchSharp,
      filterOutline,
      filterSharp,
      add,
      documentOutline,
      documentSharp,
      magnetOutline,
      magnetSharp,
      closeOutline,
      closeSharp,
      ellipsisVerticalOutline,
      ellipsisVerticalSharp,
      speedometer,
      speedometerOutline,
      speedometerSharp,
      informationCircleOutline,
      informationCircleSharp,
      arrowDownOutline,
      arrowUpOutline
    }
  },
  async created() {
    this.torrentList = inject('torrentList') as any;
    this.filter = inject('filter') as string;
    this.filterIds = inject('filterIds') as Array<number>;
    this.privateState.altSpeedEnabled = await TransmissionRPC.getSessionArgument("alt-speed-enabled");
  },
  mounted() {
    Emitter.on('switch', (id) => this.switchTorrentState(id) )
    Emitter.on('clear-selection', this.cancelSelection )
  },
  methods: {
    openSearch() {
      this.privateState.viewSearch=true;
      setTimeout(() => {
        const search = document.querySelector("#search") as any;
        search.setFocus()
      },10);
    },
    retry() {
      Emitter.emit("refresh",true);
    },
    async openOrderPopover(ev: Event) {
      Emitter.emit("swipe-enabled",false);
      const popover = await popoverController
        .create({
          component: OrderPopover,
          event: ev,
          translucent: true,
          showBackdrop: isPlatform("ios")
        })
      popover.onDidDismiss().then(() => Emitter.emit("swipe-enabled",true));
      return popover.present();
    },
    async torrentClick(torrent: Record<string, any>) {
      if(this.privateState.selection.length>0) {
        this.selectTorrent(torrent.id);
      }
      else {
        const modal = await modalController
        .create({
          component: TorrentDetails,
          componentProps: {
            id:torrent.id,
            name:torrent.name
          }
        })
        modal.onDidDismiss()
          .then(() => {
            Emitter.emit("refresh");
          })
        return modal.present();
      }
    },
    switchTorrentState(torrentId: number){
      const torrent = this.getTorrentsByIds([torrentId])[0];
      switch (torrent.status) {
        case 0:
          this.torrentAction("start",[torrent.id])
          break;
        default:
          this.torrentAction("stop",[torrent.id])
          break;
      }
    },
    switchAltSpeed(){
      TransmissionRPC.setSession({"alt-speed-enabled":!this.privateState.altSpeedEnabled})
        .then((response) => {
          if(response.result=="success"){
            this.privateState.altSpeedEnabled=!this.privateState.altSpeedEnabled;
          }
          Utils.responseToast(response.result)
        })
    },
    torrentAction(action: string, torrentIds: Array<number>){
      TransmissionRPC.torrentAction(action,torrentIds)
        .then(async (response) => {
          Utils.responseToast(response.result)
          if(response.result=="success"){
            for (const torrent of this.getTorrentsByIds(torrentIds)) {
              torrent.status=Utils.actionStatusResult(action,torrent.percentDone);
            }
          }
        })
    },
    getTorrentsByIds(torrentIds: Array<number>): Array<any>{
      return _.filter(this.torrentList, function (o) { return torrentIds.includes(o.id) })
    },
    selectTorrent(torrentId: number, remove=true){
      if(!this.privateState.selection.includes(torrentId)){
        this.privateState.selection.push(torrentId);
      }
      else if(remove) {
        this.privateState.selection.splice(this.privateState.selection.indexOf(torrentId),1);
      }
    },
    selectAll() {
      for(const torrent of this.torrentOrderedList){
        this.selectTorrent(torrent.id,false);
      }
    },
    cancelSelection() {
      this.privateState.selection=[];
    },
    async removeTorrents(torrentIds: Array<number>){
      const selectedTorrents=this.getTorrentsByIds(torrentIds);
      const name=torrentIds.length==1 ? `"${selectedTorrents[0].name}"` : `${torrentIds.length} ${Locale.torrent.other}`;

      const alert = await alertController
        .create({
          header: Locale.prompt.confirmation,
          message: Locale.formatString(Locale.prompt.remove,name) as string,
          inputs: [
            {
              name: 'deleteData',
              value: 'deleteData',
              label: Locale.prompt.deleteData,
              type: 'checkbox',
            },
          ],
          buttons: [
            {
              text: Locale.actions.cancel,
              role: 'cancel'
            },
            {
              text: Locale.prompt.confirm,
              handler: async (data) => {
                TransmissionRPC.torrentAction("remove",torrentIds,{'delete-local-data':data.includes("deleteData")})
                  .then(async (response) => {
                    Utils.responseToast(response.result);
                    if(response.result=="success"){
                      for (const torrent of selectedTorrents) {
                        torrent.deleted=true;
                      }
                      this.cancelSelection();
                    }
                  })
              },
            },
          ],
        });
      return alert.present();
    },
    async torrentActions(id: number) {
      const torrent = this.getTorrentsByIds([id])[0];
      const selection = this.privateState.selection.length>0 ? this.privateState.selection : [torrent.id];
      const actionSheet = await actionSheetController
        .create({
          header: (this.privateState.selection.length==0) ? torrent.name : Locale.selection,
          buttons: [
            {
              text: (this.privateState.selection.length==0) ? Locale.actions.select : Locale.actions.selectAll,
              handler: () => {
                if(this.privateState.selection.length==0){
                  this.selectTorrent(torrent.id);
                }
                else {
                  this.selectAll();
                }
              },
            },
            {
              text: Locale.actions.start,
              handler: () => this.torrentAction("start",selection)
            },
            {
              text: Locale.formatString(Locale.actions.startNow).toString(),
              handler: () => this.torrentAction("start-now",selection)
            },
            {
              text: Locale.actions.stop,
              handler: () => this.torrentAction("stop",selection)
            },
            {
              text: Locale.actions.reannonce,
              handler: () => this.torrentAction("reannounce",selection)
            },
            {
              text: Locale.actions.verify,
              handler: () => this.torrentAction("verify",selection)
            },
            {
              text: Locale.actions.remove,
              role: 'destructive',
              handler: async()  => {
                actionSheetController.dismiss();
                this.removeTorrents(selection)
              },
            },
            {
              text: Locale.actions.cancel,
              role: 'cancel'
            },
          ],
        });
      return actionSheet.present();
    },
    async serverInformations() {
      const infos = TransmissionRPC.sessionArguments;
      const alert = await alertController
        .create({
          header: Locale.serverInformation,
          message: `
            <p>
              <b>${Locale.transmissionVersion}</b><br>
              ${infos.version}
            </p>
            <p>
              <b>${Locale.freeSpace}</b><br>
              ${Utils.formatBytes(infos["download-dir-free-space"])}
            </p>
            <p>
              <b>${Locale.port}</b><br>
              ${infos["peer-port"]}
            </p>
          `,
          buttons: [Locale.ok],
        });
      return alert.present();
    },
    longPress(e: Event, id: number) {
      if(e){
        e.preventDefault();
      }
      this.privateState.needFallback = false;
      this.torrentActions(id);
    },
    longPressFallback(id: number) {
      if(!id){ 
        // Init fallback
        this.privateState.needFallback = true;
      }
      else if(this.privateState.needFallback) {
        this.torrentActions(id)
      }
    },
    inputFile() {
      FileHandler.inputFile();
    },
    async inputLink(type: string) {
      const alert = await alertController
        .create({
          header: type=="magnet" ? Locale.magnet : "URL",
          inputs: [
            {
              name: 'link',
              placeholder: type=="magnet" ? "Magnet link" : "Torrent URL"
            }
          ],
          buttons: [
            {
              text: Locale.actions.cancel,
              role: 'cancel'
            },
            {
              text: Locale.ok,
              handler: (data) => {
                if(type=="magnet"){
                  FileHandler.readMagnet(data.link)
                }
                else {
                  FileHandler.readURL(data.link)
                }
              },
            },
          ],
        });
      return alert.present();
    }
  }
})
</script>

<style scoped>
ion-fab {
  transition: transform .2s ease;
}

.no-fab ion-fab {
  transform: scale(0);
}

#logo span {
  color:var(--ion-color-primary);
}

#top {
  text-align: left;
  color:var(--ion-color-medium);
}

#top ion-icon {
  vertical-align: top;
}

#footer ion-icon {
  vertical-align: middle;
}

#footer .text {
 padding:0 4px;
}

#footer  .bloc {
  white-space: nowrap;
  margin-right:4px;
}

ion-fab-button[data-desc] {
  position: relative;
}

ion-fab-button[data-desc]::after {
  position: absolute;
  content: attr(data-desc);
  z-index: 1;
  right: 55px;
  bottom: 4px;
  background: var(--background);
  padding: 9px;
  border-radius: 4px;
  color: var(--color);
  box-shadow: var(--box-shadow);
}

</style>