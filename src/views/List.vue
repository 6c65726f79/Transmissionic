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
            <ion-button @click="toggleSearch()" fill="clear" :aria-label="Locale.search">
              <ion-icon slot="icon-only" :ios="searchOutline" :md="searchSharp"></ion-icon>
            </ion-button>
          </ion-buttons>
        </template>
        <template v-if="privateState.viewSearch">
          <ion-searchbar id="search" show-cancel-button="always" v-model="privateState.search" @ionCancel="toggleSearch()" :placeholder="Locale.search" :cancel-button-text="Locale.actions.cancel"></ion-searchbar>
        </template>
      </ion-toolbar>
    </ion-header>

    <ConnectionStatus
      v-if="!connectionStatus.connected"
      v-on:retry="retry()">
    </ConnectionStatus>

    <VirtualScroll v-else id="torrentList" :fullscreen="true" :items="torrentOrderedList" :item-size="itemSize" key-field="id">
      <template v-slot:start>
        <ion-list-header id="top">
          <ion-label>
            {{ torrentSelectedList.length }}
            {{ LocaleController.getPlural("torrent",torrentSelectedList.length) }} ·
            {{ Utils.formatBytes(totalSize) }} ·
            <span @click="openOrderPopover" tabindex="0" :aria-label="Locale.order">
              <ion-icon :ios="filterOutline" :md="filterSharp"></ion-icon>
              {{ Locale.order }}
            </span>
          </ion-label>
        </ion-list-header>
      </template>

      <template v-slot:default="{item}">
        <Torrent 
          :attr-id="item.id"
          :torrent="item"
          v-on:switch="switchTorrentState"
          @click="torrentClick(item)"
          @contextmenu="longPress($event,item.id)" 
          v-longpress="longPressFallback"
          :class="{ 
            selected: privateState.selection.includes(item.id),
            removed: privateState.removed.includes(item.id)
          }">
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
            <ion-fab-button color="light" :data-desc="Locale.magnet" @click="inputMagnet()">
              <ion-icon :ios="magnetOutline" :md="magnetSharp"></ion-icon>
            </ion-fab-button>
            <ion-fab-button color="light" data-desc="URL" @click="inputURL()">
              <ion-icon :ios="linkOutline" :md="linkSharp"></ion-icon>
            </ion-fab-button>
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
          {{ privateState.selection.length }}
          {{ LocaleController.getPlural("selected",privateState.selection.length) }}
        </div>
        <ion-buttons slot="end">
          <ion-button fill="clear" @click="torrentActions(privateState.selection[0])">
            <ion-icon slot="icon-only" :ios="ellipsisVerticalOutline" :md="ellipsisVerticalSharp"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      <ion-toolbar v-else id="footer">
        <ion-buttons slot="start">
          <ion-button fill="clear" @click="serverConfiguration()" :aria-label="Locale.serverConfig">
            <ion-icon slot="icon-only" :ios="constructOutline" :md="constructSharp"></ion-icon>
          </ion-button>
          <ion-button fill="clear" id="alt-speed" @click="switchAltSpeed()" aria-label="Alternative speed" :aria-checked="altSpeedEnabled()">
            <ion-icon 
              slot="icon-only"
              :color="altSpeedEnabled() ? 'primary' : undefined"
              :ios="altSpeedEnabled() ? speedometer : speedometerOutline"
              :md="speedometerSharp">
            </ion-icon>
          </ion-button>
          <ion-button fill="clear" @click="serverInformations()" :aria-label="Locale.serverInformation">
            <ion-icon slot="icon-only" :ios="informationCircleOutline" :md="informationCircleSharp"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <div>
            <span class="bloc" aria-label="Download speed">
              <ion-icon :icon="arrowDownOutline" color="success"></ion-icon> {{ Utils.formatBytes(downloadSpeed(),1,true) }}
            </span>
            <span class="bloc" aria-label="Upload speed">
              <ion-icon :icon="arrowUpOutline" color="primary"></ion-icon> {{ Utils.formatBytes(uploadSpeed(),1,true) }}
            </span>
          </div>
          <ion-button fill="clear" @click="openStatsPopover" :aria-label="Locale.statistics">
            <ion-icon slot="icon-only" :ios="analyticsOutline" :md="analyticsSharp"></ion-icon>
          </ion-button>
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
  arrowUpOutline,
  constructOutline,
  constructSharp,
  linkOutline,
  linkSharp,
  analyticsOutline,
  analyticsSharp,
  
} from 'ionicons/icons';
import ConnectionStatus from './components/ConnectionStatus.vue';
import TorrentDetails from './TorrentDetails.vue'
import ServerConfig from './ServerConfig.vue'
import VirtualScroll from './components/VirtualScroll.vue'
import Torrent from './components/Torrent.vue'
import OrderPopover from './components/OrderPopover.vue'
import StatsPopover from './components/StatsPopover.vue'
import { TransmissionRPC } from "../services/TransmissionRPC";
import { UserSettings } from "../services/UserSettings";
import { FileHandler } from "../services/FileHandler";
import { LocaleController } from "../services/LocaleController";
import { Shortcuts } from '../services/Shortcuts';
import { Locale } from "../services/Locale";
import { Utils } from "../services/Utils";
import { Emitter } from "../services/Emitter";
import * as _ from 'lodash';

export default defineComponent({
  name: 'list',
  data() {
    return {
      torrentList:[] as Array<any>,
      filter:0,
      filterIds:[] as number[],
      connectionStatus: {} as Record<string,any>,
      sharedState: UserSettings.state,
      privateState: {
        viewSearch:false,
        search:"",
        viewPopover:false,
        needFallback:false,
        selection: [] as number[],
        removed: [] as number[],
        altSpeedEnabled:false
      }
    }
  },
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
      let list = this.torrentList;
      const filter = this.filter;
      const removed = this.privateState.removed;
      const selection = this.privateState.selection;

      if(this.filterIds.length>0){
        list = _.filter(list, (o) => {
          return this.filterIds.includes(o.id)
        });
      }

      // Filter list by selected filter
      list = _.filter(list, function(o) {
        if(removed.includes(o.id)) return false; // Don't list removed torrents
        return filter==9 ? selection.includes(o.id) : Utils.getTorrentFilters(o).includes(filter)
      });

      // Filter list by search value
      if(this.privateState.search!=""){
        const search=this.privateState.search.toLowerCase();
        list = _.filter(list, function(o) {
          let include=false;
          if(UserSettings.state.searchByName){
            include=o.name.toLowerCase().replace(/\./g,' ').indexOf(search.replace(/\./g,' ')) >= 0;
          }
          if(UserSettings.state.searchByDirectory && !include){
            include=o.downloadDir.toLowerCase().indexOf(search) >= 0;
          }
          return include;
        });
      }

      return list
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
    uploadSpeed: function (): any {
      return () => TransmissionRPC.sessionStats ? TransmissionRPC.sessionStats.uploadSpeed : 0;
    },
    downloadSpeed: function (): any {
      return () => TransmissionRPC.sessionStats ? TransmissionRPC.sessionStats.downloadSpeed: 0;
    },
    itemSize() {
      return UserSettings.state.condensedMode ? 46 : 72;
    },
    totalSize: function (): any {
      return this.torrentSelectedList.reduce(function(sum, current) {
        return sum + (current.percentDone * current.sizeWhenDone);
      }, 0);
    }
  },
  setup() {
    return { 
      Locale,
      LocaleController,
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
      arrowUpOutline,
      constructOutline,
      constructSharp,
      linkOutline,
      linkSharp,
      analyticsOutline,
      analyticsSharp,
    }
  },
  async created() {
    this.torrentList = inject('torrentList') as any;
    this.filter = inject('filter') as number;
    this.filterIds = inject('filterIds') as Array<number>;
    this.connectionStatus = inject('connectionStatus') as Record<string,any>;
  },
  mounted() {
    Emitter.on('switch', (id: any) => this.switchTorrentState(id) )
    Emitter.on('clear-selection', this.cancelSelection)
    Emitter.on('torrent-position', (data: any) => this.changeTorrentPosition(data.id,data.up));
    Emitter.on('add-torrent', this.inputFile);
    Emitter.on('add-magnet', this.inputMagnet);
    Emitter.on('add-url', this.inputURL);
    Emitter.on('select-all', this.selectAll);
    Emitter.on('toggle-search', this.toggleSearch);
    Emitter.on('info-server', this.serverInformations);
    Emitter.on('config-server', this.serverConfiguration);
    
  },
  methods: {
    toggleSearch() {
      this.privateState.viewSearch = !this.privateState.viewSearch;
      if(this.privateState.viewSearch){
        setTimeout(() => {
          const search = document.querySelector("#search") as Record<string,any>;
          search?.setFocus();
        },10);
      }
      else {
        this.privateState.search="";
      }
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
    async openStatsPopover(ev: Event) {
      Emitter.emit("swipe-enabled",false);
      const popover = await popoverController
        .create({
          component: StatsPopover,
          event: ev,
          translucent: true,
          cssClass: 'stats-popover',
          showBackdrop: isPlatform("ios")
        })
      popover.onDidDismiss().then(() => Emitter.emit("swipe-enabled",true));
      return popover.present();
    },
    async torrentClick(torrent: Record<string, any>) {
      if(this.privateState.selection.length>0 || Shortcuts.isPressed("Shift")) {
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
            Emitter.emit("refresh", false);
            Emitter.emit("unmount-torrent-details");
          })
        return modal.present();
      }
    },
    switchTorrentState(torrentId: number){
      const torrent = this.getTorrentsByIds([torrentId])[0];
      if(torrent.status===0){
        this.torrentAction("start",[torrent.id])
      }
      else {
        this.torrentAction("stop",[torrent.id])
      }
    },
    altSpeedEnabled(): boolean {
      if(TransmissionRPC.sessionArguments){
        this.privateState.altSpeedEnabled = TransmissionRPC.sessionArguments['alt-speed-enabled'];
      }
      return this.privateState.altSpeedEnabled;
    },
    switchAltSpeed(){
      TransmissionRPC.setSession({"alt-speed-enabled":!this.altSpeedEnabled()})
        .then((response) => {
          Utils.responseToast(response.result)
          this.privateState.altSpeedEnabled=!this.privateState.altSpeedEnabled;
        })
    },
    torrentAction(action: string, torrentIds: Array<number>){
      TransmissionRPC.torrentAction(action,torrentIds)
        .then((response) => {
          Utils.responseToast(response.result)
          for (const torrent of this.getTorrentsByIds(torrentIds)) {
            torrent.status=Utils.actionStatusResult(action,torrent.status,torrent.percentDone);
          }
        })
        .catch((error) => {
          Utils.responseToast(error.message);
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
      const name=torrentIds.length==1 ? `"${selectedTorrents[0].name}"` : `${torrentIds.length} ${LocaleController.getForm("torrent","other")}`;

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
              handler: (data: Array<string>) => {
                TransmissionRPC.torrentAction("remove",torrentIds,{'delete-local-data':data.includes("deleteData")})
                  .then((response) => {
                    Utils.responseToast(response.result);
                    for (const torrent of selectedTorrents) {
                      this.privateState.removed.push(torrent.id);
                    }
                    this.cancelSelection();
                  })
                  .catch((error) => {
                    Utils.responseToast(error.message);
                  })
              },
            },
          ],
        });
      return alert.present();
    },
    async torrentActions(id: number) {
      Utils.pushState();
      const torrent = this.getTorrentsByIds([id])[0];
      const selection = this.privateState.selection.length>0 ? this.privateState.selection : [torrent.id];

      let buttons = [
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
          text: Locale.actions.reannounce,
          handler: () => this.torrentAction("reannounce",selection)
        },
        {
          text: Locale.actions.verify,
          handler: () => this.torrentAction("verify",selection)
        },
        {
          text: Locale.actions.openInExplorer,
          handler: () => {
            TransmissionRPC.getTorrentDetails(torrent.id).then((details) => {
              const success = FileHandler.openExplorer(details);
              if(!success){
                Utils.responseToast(Locale.error.notFound);
              }
            });
          }
        },
        {
          text: Locale.actions.remove,
          role: 'destructive',
          handler: async ()  => {
            actionSheetController.dismiss();
            this.removeTorrents(selection)
          },
        },
        {
          text: Locale.actions.cancel,
          role: 'cancel'
        },
      ];

      if(!isPlatform("electron") || selection.length>1){
        buttons.splice(6, 1);
      }

      const actionSheet = await actionSheetController
        .create({
          header: (this.privateState.selection.length==0) ? torrent.name : Locale.selection,
          buttons
        });
      return actionSheet.present();
    },
    changeTorrentPosition(id: number,up: boolean) {
      let pos = -1;
      let found = false;
      while(!found && pos < this.torrentOrderedList.length){
        pos++;
        if(this.torrentOrderedList[pos].id==id){
          found=true;
        }
      }
      const invertWith = up ?  pos-1 : pos+1;
      if(invertWith>=0 && invertWith<this.torrentOrderedList.length){
        const newPos = Math.round(this.torrentOrderedList[invertWith].queuePosition);
        TransmissionRPC.torrentAction("set",[id],{"queuePosition":newPos})
          .then((response) => {
            Utils.responseToast(response.result)
            const move = UserSettings.state.reverse ? -0.1 : 0.1;
            this.getTorrentsByIds([id])[0].queuePosition=up ? newPos-move : newPos+move;
          })
          .catch((error) => {
            Utils.responseToast(error.message);
          })
      }
    },
    async serverInformations() {
      if(this.connectionStatus.connected){
        Utils.pushState();
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
      }
    },
    async serverConfiguration() {
      if(this.connectionStatus.connected){
        const modal = await modalController
        .create({
          component: ServerConfig
        })
        return modal.present();
      }
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
    async inputMagnet() {
      const alert = await alertController
        .create({
          header: Locale.magnet,
          message: "BitTorrent info hash (BTIH)",
          inputs: [
            {
              name: 'link',
              placeholder: Locale.magnetLink
            }
          ],
          buttons: [
            {
              text: Locale.actions.cancel,
              role: 'cancel'
            },
            {
              text: Locale.ok,
              handler: (data: Record<string,any>) => {
                FileHandler.readHashOrMagnet(data.link);
              },
            },
          ],
        });
      return alert.present();
    },
    async inputURL() {
      const alert = await alertController
        .create({
          header: "URL",
          inputs: [
            {
              name: 'url',
              placeholder: Locale.torrentFileLink
            }
          ],
          buttons: [
            {
              text: Locale.actions.cancel,
              role: 'cancel'
            },
            {
              text: Locale.ok,
              handler: (data: Record<string,any>) => {
                FileHandler.readURL(data.url);
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

#torrentList .removed {
  display:none;
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

#alt-speed {
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
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