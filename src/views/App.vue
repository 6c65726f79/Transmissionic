<template>
  <ion-app>
    <ion-split-pane contentId="main-content" :disabled="!sharedState.expandMenu">
      <ion-menu contentId="main-content" type="overlay" menu-id="left" :swipeGesture="privateState.swipeEnabled" v-on:ionDidClose="closeTrackerList()" v-on:ionDidOpen="Utils.pushState()">

        <!-- Main menu -->
        <ion-content v-show="!privateState.trackerListOpened || sharedState.showTrackerList" id="navigation" ref="navigation" scrollbar :class="{separator: sharedState.showTrackerList}">
          <ion-list id="servers-list">
            <ion-list-header>{{ Locale.servers }}</ion-list-header>
  
            <ion-menu-toggle class="ion-activatable" auto-hide="false" v-for="(s, i) in privateState.serverList" :key="i">
              <ion-item @click="selectServer(i)" class="hydrated" lines="none" detail="false" :class="{ selected: privateState.selectedServer === i }" button>
                <ion-icon slot="start" :ios="serverOutline" :md="serverSharp"></ion-icon>
                <ion-label>{{ s.name }}</ion-label>
                <ion-icon slot="end" :ios="pencilOutline" :md="pencilSharp" @click="openServerDetailsModal(i,$event)" tabindex="0" :aria-label="Locale.serverDetails"></ion-icon>
              </ion-item>
            </ion-menu-toggle>

            <ion-menu-toggle auto-hide="false">
              <ion-item @click="addServer($event)" class="hydrated" lines="none" detail="false" button>
                <ion-icon slot="start" :ios="addOutline" :md="addSharp"></ion-icon>
                <ion-label>{{ Locale.add }}</ion-label>
              </ion-item>
            </ion-menu-toggle>
          </ion-list>

          <ion-list id="trackers-list" v-show="!sharedState.showTrackerList">
            <ion-list-header>{{ LocaleController.getForm("tracker","other") }}</ion-list-header>

            <ion-menu-toggle auto-hide="false">
              <ion-item @click="openTrackerList($event)" id="tracker-dropdown" lines="none" detail="false" button>
                <ion-label>{{ privateState.selectedTracker ? Utils.trackerDomain(privateState.selectedTracker).protocol+"://"+Utils.trackerDomain(privateState.selectedTracker).domain : Locale.filters.all }}</ion-label>
                <div slot="end">
                  <ion-icon :ios="caretDownOutline" :md="caretDownSharp"></ion-icon>
                </div>
              </ion-item>
            </ion-menu-toggle>
          </ion-list>
  
          <ion-list id="filters-list">
            <ion-list-header>{{ Locale.filters.filters }}</ion-list-header>

            <ion-menu-toggle auto-hide="false" v-for="(f, index) in privateState.filters" :key="index">
              <ion-item @click="privateState.selectedFilter = index" lines="none" :class="{ selected: privateState.selectedFilter === index }" button>
                <ion-icon slot="start" :ios="f.iosIcon" :md="f.mdIcon"></ion-icon>
                <ion-label class="text-transform">{{ f.label() }}</ion-label>
                <div slot="end">
                  <ion-badge>{{ privateState.torrentFilters[f.id] }}</ion-badge>
                </div>
              </ion-item>
            </ion-menu-toggle>
          </ion-list>
        </ion-content>

        <!-- Tracker list -->
        <ion-content v-show="privateState.trackerListOpened || sharedState.showTrackerList" id="trackers" ref="trackers">
          <ion-list>
            <ion-list-header>{{ LocaleController.getForm("tracker","other") }}</ion-list-header>
            <ion-menu-toggle auto-hide="false">
              <ion-item @click="selectTracker()" lines="none" :class="{selected:privateState.selectedTracker==''}" button>
                <ion-label>{{ Locale.filters.all }}</ion-label>
              </ion-item>
            </ion-menu-toggle>
            <ion-menu-toggle auto-hide="false" v-for="tracker in trackerList" :key="tracker.id">
              <ion-item @click="selectTracker(tracker)" lines="none" :class="{selected:privateState.selectedTracker==tracker.announce}" button>
                <ion-label :title="tracker.announce">{{tracker.announce}}</ion-label>
                <div slot="end">
                  <ion-badge>{{ tracker.ids.length }}</ion-badge>
                </div>
              </ion-item>
            </ion-menu-toggle>
            <ion-infinite-scroll
              @ionInfinite="displayTrackers($event)" 
              threshold="100px" 
              v-if="!sharedState.showTrackerList"
            >
              <ion-infinite-scroll-content
                loading-spinner="circular">
              </ion-infinite-scroll-content>
            </ion-infinite-scroll>
          </ion-list>
        </ion-content>

        <!-- Menu footer -->
        <ion-footer>
          <ion-list id="other-list">
            <ion-menu-toggle auto-hide="false">
              <ion-item @click="openSettingsModal()" lines="none" detail="false" class="hydrated" button>
                <ion-icon slot="start" :ios="settingsOutline" :md="settingsSharp"></ion-icon>
                <ion-label>{{ Locale.settings }}</ion-label>
              </ion-item>
            </ion-menu-toggle>

            <ion-menu-toggle auto-hide="false">
              <ion-item @click="openAboutModal()" lines="none" detail="false" class="hydrated" button>
                <ion-icon slot="start" :ios="helpCircleOutline" :md="helpCircleSharp"></ion-icon>
                <ion-label>{{ Locale.about.about }}</ion-label>
              </ion-item>
            </ion-menu-toggle>
          </ion-list>
        </ion-footer>
      </ion-menu>
      
      <!-- Torrent list -->
      <List id="main-content"></List>
    </ion-split-pane>
  </ion-app>
</template>

<script lang="ts">
import { defineComponent,computed } from 'vue';
import { 
  modalController,
  menuController,
  IonApp, 
  IonContent, 
  IonIcon, 
  IonItem, 
  IonLabel, 
  IonList, 
  IonListHeader, 
  IonMenu, 
  IonMenuToggle, 
  IonSplitPane,
  IonFooter,
  IonBadge,
  IonInfiniteScroll, 
  IonInfiniteScrollContent
} from '@ionic/vue';
import {
  serverOutline,
  serverSharp,
  pencilOutline,
  pencilSharp,
  addOutline,
  addSharp,
  caretDownOutline,
  caretDownSharp,
  settingsOutline,
  settingsSharp,
  helpCircleOutline,
  helpCircleSharp,
  layersOutline,
  layersSharp,
  flashOutline,
  flashSharp,
  cloudDownloadOutline,
  cloudDownloadSharp,
  cloudUploadOutline,
  cloudUploadSharp,
  cloudDoneOutline,
  cloudDoneSharp,
  cloudOfflineOutline,
  cloudOfflineSharp,
  warningOutline,
  warningSharp,
  hourglassOutline,
  hourglassSharp,
  checkmarkCircleOutline,
  checkmarkCircleSharp,
  reloadOutline,
  reloadSharp
} from 'ionicons/icons';
import Settings from './Settings.vue'
import ServerDetails from './ServerDetails.vue'
import List from './List.vue'
import About from './About.vue'
import { TransmissionRPC } from "../services/TransmissionRPC";
import { UserSettings } from "../services/UserSettings";
import { Locale } from "../services/Locale";
import { LocaleController } from "../services/LocaleController";
import { Utils } from "../services/Utils";
import { Emitter } from "../services/Emitter";
import { SplashScreen } from '@capacitor/splash-screen';
import * as _ from 'lodash';

export default defineComponent({
  name: 'App',
  components: {
    List,
    IonApp, 
    IonContent, 
    IonIcon, 
    IonItem, 
    IonLabel, 
    IonList, 
    IonListHeader, 
    IonMenu, 
    IonMenuToggle, 
    IonSplitPane,
    IonFooter,
    IonBadge,
    IonInfiniteScroll, 
    IonInfiniteScrollContent
  },
  data() {
    return { 
      sharedState: UserSettings.state,
      privateState: {
        selectedServer:0,
        selectedFilter:0,
        selectedTracker:"",
        selectedIds:[] as Array<number>,
        refresh:null as any,
        torrentList:[] as Array<any>,
        torrentFilters: [] as Array<any>,
        serverList: [] as Array<Record<string,unknown>>,
        displayTrackerCount: 0,
        fullTrackerList: [] as Record<string, any>[],
        swipeEnabled:true,
        trackerListOpened:false,
        connectionStatus:{
          connected:false,
          loading:true,
          error:"",
          sessionArguments:null as any,
        },
        filters: [
          {
            id:0,
            value:"all",
            label:() => Locale.filters.all,
            iosIcon: layersOutline,
            mdIcon: layersSharp
          },
          {
            id:1,
            value:"active",
            label:() => Locale.filters.active,
            iosIcon: flashOutline,
            mdIcon: flashSharp
          },
          {
            id:2,
            value:"downloading",
            label:() => Locale.filters.downloading,
            iosIcon: cloudDownloadOutline,
            mdIcon: cloudDownloadSharp
          },
          {
            id:3,
            value:"seeding",
            label:() => Locale.filters.seeding,
            iosIcon: cloudUploadOutline,
            mdIcon: cloudUploadSharp
          },
          {
            id:4,
            value:"completed",
            label:() => Locale.filters.completed,
            iosIcon: cloudDoneOutline,
            mdIcon: cloudDoneSharp
          },
          {
            id:5,
            value:"stopped",
            label:() => Locale.filters.stopped,
            iosIcon: cloudOfflineOutline,
            mdIcon: cloudOfflineSharp
          },
          {
            id:6,
            value:"error",
            label:() => Locale.error.error,
            iosIcon: warningOutline,
            mdIcon: warningSharp
          },
          {
            id:7,
            value:"queued",
            label:() => Locale.filters.queued,
            iosIcon: hourglassOutline,
            mdIcon: hourglassSharp
          },
          {
            id:8,
            value:"verifying",
            label:() => Locale.filters.verifying,
            iosIcon: reloadOutline,
            mdIcon: reloadSharp
          },
          {
            id:9,
            value:"selected",
            label:() => LocaleController.getPlural("selected",1),
            iosIcon: checkmarkCircleOutline,
            mdIcon: checkmarkCircleSharp
          }
        ]
      }
    }
  },
  provide() {
    return {
      connectionStatus: this.privateState.connectionStatus,
      serverCount: computed(() => this.privateState.serverList.length),
      torrentList: computed(() => this.privateState.torrentList),
      filter: computed(() => this.privateState.filters[this.privateState.selectedFilter].id),
      filterIds: computed(() => this.privateState.selectedIds)
    } 
  },
  setup() {
    return { 
      Locale,
      LocaleController,
      Utils,
      serverOutline,
      serverSharp,
      pencilOutline,
      pencilSharp,
      addOutline,
      addSharp,
      caretDownOutline,
      caretDownSharp,
      settingsOutline,
      settingsSharp,
      helpCircleOutline,
      helpCircleSharp
    }
  },
  watch: {
    colorScheme(val) {
      Utils.setTheme(val);
    },
    language() {
      LocaleController.setLanguage(UserSettings.getLanguage());
    },
    "privateState.serverList.length": async function() {
      if(this.privateState.selectedServer>=this.privateState.serverList.length){
        this.privateState.selectedServer=this.privateState.serverList.length-1;
      }
      if(this.privateState.selectedServer<0){
        this.privateState.serverList = await UserSettings.loadServerList();
        this.privateState.selectedServer = 0;
      }
      this.selectServer(this.privateState.selectedServer);
    }
  },
  async beforeCreate() {
    await UserSettings.loadSettings();
    this.privateState.selectedServer = UserSettings.state.selectedServer;
    Utils.registerMagnetLinkProtocol();
    if(UserSettings.state.language=="default"){
      await LocaleController.setLanguage(UserSettings.getLanguage());
    }
    await UserSettings.loadServerList()
      .then((result)=>{
        this.privateState.serverList = result;
        this.privateState.connectionStatus.loading=false;
      })
    SplashScreen.hide();
    document.body.classList.toggle("loading",false);
  },
  created() {
    Utils.setTheme(this.sharedState.colorScheme);

    // Detect light/dark mode change from OS
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e: any) => {
        if (e.origin && e.origin !== window.location.origin)
          return;

        if(this.sharedState.colorScheme=="default"){
          Utils.setTheme(e.matches ? "dark" : "light");
        }
    });
  },
  mounted() {
    // Custom scrollbar for Web Browser and Electron
    Utils.customScrollbar(this.$refs.navigation);
    Utils.customScrollbar(this.$refs.trackers);
    
    Emitter.on('refresh', (clean: any) => { this.refresh(clean); });
    Emitter.on('add-server', this.addServer);
    Emitter.on('swipe-enabled', (value: any) => this.privateState.swipeEnabled=value );
    Emitter.on('about', this.openAboutModal);
    Emitter.on('settings', this.openSettingsModal);
    Emitter.on('toggle-menu', () => { menuController.toggle("left") });
    Emitter.on('select-filter', (index: any) => {
      this.privateState.selectedFilter=index-1;
    })
    Emitter.on('select-server', (i: any) => { this.selectServer(i) })
  },
  computed: {
    colorScheme: function(): string {
      return this.sharedState.colorScheme
    },
    language: function(): string {
      return this.sharedState.language
    },
    trackerList: function(): Record<string, any>[] {
      return this.sharedState.showTrackerList ? this.privateState.fullTrackerList : this.privateState.fullTrackerList.slice(0, this.privateState.displayTrackerCount)
    }
  },
  methods: {

    addServer(e: any=null) {
      this.openServerDetailsModal(this.privateState.serverList.length,e,true);
    },

    setRefreshInterval() {
      clearInterval(this.privateState.refresh);
      this.privateState.refresh = setInterval(() => {
        if(!this.privateState.connectionStatus.loading && this.privateState.connectionStatus.error=="") { 
          this.getTorrents(false, true)
        }
      },this.sharedState.refreshInterval*1000);
    },

    refresh(clean=false) {
      if(this.privateState.serverList.length>0) {
        this.setRefreshInterval();
        this.getTorrents(clean, false);
      }
    },

    openTrackerList(e: Event) {
      e.stopPropagation();
      this.privateState.trackerListOpened=true;
      this.displayTrackers();
    },

    closeTrackerList() {
      this.privateState.trackerListOpened=false;
      this.privateState.displayTrackerCount=0;
    },

    displayTrackers(ev?: any) {
      this.privateState.displayTrackerCount += Math.round(window.innerHeight/48);

      if(ev){
        ev.target.complete();
      }
    },

    getTorrentFilters() {
      this.privateState.torrentFilters = [];
      this.privateState.torrentList.map((torrent: Record<string,any>) => {
        if(this.privateState.selectedIds.includes(torrent.id) || this.privateState.selectedIds.length==0) {
          Utils.getTorrentFilters(torrent).forEach((filter) => {
            this.privateState.torrentFilters[filter] = this.privateState.torrentFilters[filter] ? this.privateState.torrentFilters[filter]+1 : 1;
          })
        }
        
      });
    },

    selectTracker(tracker?: Record<string,any>){
      if(tracker){
        this.privateState.selectedTracker=tracker.announce
        this.privateState.selectedIds=tracker.ids
      }
      else {
        this.privateState.selectedTracker=""
        this.privateState.selectedIds=[];
      }
      this.closeTrackerList();
      this.getTorrentFilters();
    },

    getTrackerList() {
      return TransmissionRPC.persistentData ? TransmissionRPC.persistentData.trackers : []
    },

    async openSettingsModal() {
      const modal = await modalController
        .create({
          component: Settings,
          cssClass: 'settings'
        })
      modal.onDidDismiss()
        .then(() => {
          this.refresh(false)
        })
      return modal.present();
    },

    async openAboutModal() {
      const modal = await modalController
        .create({
          component: About
        })
      modal.onDidDismiss()
        .then(() => {
          this.refresh(false)
        })
      return modal.present();
    },

    async openServerDetailsModal(serverId: number,e: any, add=false) {
      if(e){
        e.stopPropagation();
      }
      menuController.close("left")
      const modal = await modalController
        .create({
          component: ServerDetails,
          componentProps: {
            serverList:this.privateState.serverList,
            serverId:serverId,
            add:add
          }
        })
      modal.onDidDismiss()
        .then(() => {
          this.refresh(false)
        })
      return modal.present();
    },

    selectServer(serverId=0) {
      Emitter.emit("clear-selection");
      UserSettings.setValue("selectedServer",serverId,true);
      this.privateState.torrentList=[];
      this.privateState.selectedIds=[];
      this.privateState.selectedTracker="";
      this.privateState.selectedServer=serverId;
      this.privateState.connectionStatus.error="";
      this.privateState.connectionStatus.loading=true;
      this.privateState.connectionStatus.connected=false;
      TransmissionRPC.setServer(this.privateState.serverList[serverId], this.sharedState.timeout)
        .then((response) => {
          this.privateState.connectionStatus.sessionArguments = response;
          this.setRefreshInterval();
          this.getTorrents(true);
          TransmissionRPC.getPersistentData('trackers').then(trackers => this.privateState.fullTrackerList=trackers);
        })
        .catch((error) => {
          if(error.message){
            this.privateState.connectionStatus.loading=false;
            this.privateState.connectionStatus.error=error.message;
          }
        })
    },

    async getTorrents(clean=false, refresh=false) {
      const isModalOpened = await modalController.getTop();
      if(!isModalOpened || clean){
        this.privateState.connectionStatus.loading=true;
        if(clean){
          this.setRefreshInterval();
          this.privateState.connectionStatus.error="";
          this.privateState.torrentList=[];
        }
        TransmissionRPC.getTorrents((refresh && !clean))
          .then((response: Record<string,Array<any>>) => {
            this.privateState.connectionStatus.error="";
            this.privateState.connectionStatus.connected=true;
            this.parseTorrentListResponse(response, clean, refresh);
          })
          .catch((error) => {
            if(error.message){
              this.privateState.connectionStatus.connected=false;
              this.privateState.connectionStatus.error=error.message;
              this.privateState.torrentList=[];
            }
          })
          .then(() => {
            this.privateState.connectionStatus.loading=false;
          })
      }
    },

    parseTorrentListResponse(response: Record<string,Array<any>>, clean: boolean, refresh: boolean) {
      if(refresh){
        this.privateState.torrentList = _.unionBy(response.torrents, this.privateState.torrentList, 'id');
        if(response.removed.length>0){
          this.privateState.torrentList = this.privateState.torrentList.filter(function(torrent) {
            return !response.removed.includes(torrent.id);
          });
        }
        if(response.torrents.length>0 || response.removed.length>0){
          this.getTorrentFilters();
        }
      }
      else {
        this.privateState.torrentList = response.torrents;
        this.getTorrentFilters();
      }
    }
  }
});
</script>

<style scoped>
#logo span {
  color:var(--ion-color-primary);
}

.separator {
  border-bottom: 1px solid var(--ion-color-step-150, #d7d8da);
}

ion-menu.menu-pane-visible {
  max-width: 304px;
}

ion-note {
  display: inline-block;
  font-size: 16px;

  color: var(--ion-color-medium-shade);
}

ion-item.selected {
  --color: var(--ion-color-primary);
}
</style>
