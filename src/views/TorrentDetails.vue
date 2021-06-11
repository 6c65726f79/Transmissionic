<template>

    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="#" @click="modalClose()"></ion-back-button>
        </ion-buttons>
        <ion-title>{{privateState.details.name}}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="switchTorrentState()" fill="clear">
            <ion-icon 
              slot="icon-only"
              :ios="privateState.details.status==0 ? playOutline : pauseOutline"
              :md="privateState.details.status==0 ? playSharp : pauseSharp">
            </ion-icon>
          </ion-button>
          <ion-button @click="saveDetails()" fill="clear" v-if="privateState.modified">
            <ion-icon slot="icon-only" :ios="saveOutline" :md="saveSharp"></ion-icon>
          </ion-button>
          <ion-button @click="torrentActions()" fill="clear" v-else>
            <ion-icon slot="icon-only" :ios="ellipsisVerticalOutline" :md="ellipsisVerticalSharp"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment ref="tabs" @ionChange="tabController.setTab($event.detail.value)" v-model="tabController.state.selectedTab" scrollable>
          <ion-segment-button :value="0">
            <ion-label>{{ Locale.general }}</ion-label>
          </ion-segment-button>
          <ion-segment-button :value="1">
            <ion-label>{{ Locale.options }}</ion-label>
          </ion-segment-button>
          <ion-segment-button :value="2">
            <ion-label>{{ Locale.files }}</ion-label>
          </ion-segment-button>
          <ion-segment-button :value="3">
            <ion-label>{{ Locale.tracker.other }}</ion-label>
          </ion-segment-button>
          <ion-segment-button :value="4">
            <ion-label>{{ Locale.peer.other }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ConnectionStatus
      v-if="privateState.connectionStatus.loading || privateState.connectionStatus.error!=''"
      v-on:retry="loadDetails()">
    </ConnectionStatus>

    <ion-slides v-show="privateState.connectionStatus.connected" ref="slider" :options="tabController.slidesOptions" v-on:ionSlideTransitionEnd="tabController.slideChanged()">
      <ion-slide>
        <Infos v-if="tabController.isVisible(0)"></Infos>
      </ion-slide>
      <ion-slide>
        <Options v-if="tabController.isVisible(1)"></Options>
      </ion-slide>
      <ion-slide>
        <Files v-if="tabController.isVisible(2)" v-on:changeDirectory="changeDirectory"></Files>
      </ion-slide>
      <ion-slide>
        <Trackers v-if="tabController.isVisible(3)"></Trackers>
      </ion-slide>
      <ion-slide>
        <Peers v-if="tabController.isVisible(4)"></Peers>
      </ion-slide>
    </ion-slides>

</template>

<script lang="ts">
import { defineComponent, computed, inject} from 'vue';
import { 
  isPlatform,
  modalController,
  loadingController,
  alertController,
  actionSheetController,
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonIcon,
  IonButton,
  IonSlides,
  IonSlide
} from '@ionic/vue';
import {
  playOutline,
  pauseOutline,
  playSharp,
  pauseSharp,
  saveOutline,
  saveSharp,
  ellipsisVerticalOutline,
  ellipsisVerticalSharp
} from 'ionicons/icons';
import { Locale } from "../services/Locale";
import { Utils } from "../services/Utils";
import { UserSettings } from "../services/UserSettings";
import { FileHandler } from '../services/FileHandler';
import LocationAlert from './components/LocationAlert.vue';
import ConnectionStatus from './components/ConnectionStatus.vue';
import Infos from './components/Infos.vue';
import Options from './components/Options.vue';
import Files from './components/Files.vue';
import Trackers from './components/Trackers.vue';
import Peers from './components/Peers.vue';
import TabController from '../services/TabController';
import { TransmissionRPC } from '../services/TransmissionRPC';
import { iosEnterAnimation } from './animations/ios.enter';
import { iosLeaveAnimation } from './animations/ios.leave';
import { mdEnterAnimation } from './animations/md.enter';
import { mdLeaveAnimation } from './animations/md.leave';
import { Emitter } from "../services/Emitter";
import * as _ from 'lodash';

export default defineComponent({
  name: 'TorrentDetails',
  props: ['id','name'],
  components: { 
    ConnectionStatus,
    Infos,
    Options,
    Files,
    Trackers,
    Peers,
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonIcon,
    IonButton,
    IonSlides,
    IonSlide
  },
  data() {
    return {
      sharedState: UserSettings.state,
      privateState: {
        details: {} as Record<string,any>,
        newOptions: {} as Record<string,any>,
        modified:false,
        connectionStatus: {} as Record<string,any>,
        refreshInterval: null as any,
        currentDirectory:"",
        optionKeys:[
          "downloadLimit",
          "downloadLimited",
          "uploadLimit",
          "uploadLimited",
          "seedRatioMode",
          "seedRatioLimit",
          "seedIdleMode",
          "seedIdleLimit",
          "peer-limit",
          "bandwidthPriority"
        ]
      }
    }
  },
  provide() {
    return {
      id:  computed(() => this.id),
      details:  computed(() => this.privateState.details),
      newOptions:  computed(() => this.privateState.newOptions),
      fileStats:  computed(() => this.privateState.newOptions.fileStats),
      currentDirectory:  computed(() => this.privateState.currentDirectory),
    } 
  },
  watch: {
    'privateState.newOptions': {
      handler: function (){
        this.privateState.modified=!_.isEqual(this.optionList(this.privateState.details), this.optionList(this.privateState.newOptions))
      },
      deep: true
    }
  },
  setup() {
    Utils.pushState()

    const tabController = new TabController();

    return { 
      Locale,
      Utils,
      tabController,
      playOutline,
      pauseOutline,
      playSharp,
      pauseSharp,
      saveOutline,
      saveSharp,
      ellipsisVerticalOutline,
      ellipsisVerticalSharp
    }
  },
  created() {
    this.privateState.connectionStatus = inject('connectionStatus') as Record<string,any>;

    this.privateState.details.name=this.name;

    this.loadDetails();
    this.privateState.refreshInterval = setInterval(() => {
      if(!this.privateState.connectionStatus.loading && this.privateState.connectionStatus.error=="") { 
        this.loadDetails(true);
      }
    },this.sharedState.refreshInterval*1000);
  },
  mounted() {
    // Custom scrollbar for Web Browser and Electron
    Utils.customScrollbar(this.$refs.tabs, false, false);
    Utils.customScrollbar(this.$refs.content);

    this.tabController.setElements(this.$refs.slider,this.$refs.tabs);

  },
  methods: {
    async loadDetails(refresh=false) {
      if(!refresh){
        this.privateState.connectionStatus.error="";
        this.privateState.connectionStatus.loading=true;
      }
      await TransmissionRPC.getTorrentDetails(this.id)
        .then((response) => {
          this.privateState.connectionStatus.error="";
          this.privateState.connectionStatus.connected=true;
          this.privateState.details = response
        })
        .catch((error) => {
          if(error.message){
            this.privateState.connectionStatus.connected=false;
            this.privateState.connectionStatus.error=error.message;
          }
        })

      if(UserSettings.state.useBits){
        // Bytes to bits
        this.privateState.details.downloadLimit = this.privateState.details.downloadLimit*8;
        this.privateState.details.uploadLimit = this.privateState.details.uploadLimit*8;
      }

      if(!this.privateState.modified){
        this.privateState.newOptions = _.cloneDeep(this.privateState.details);
      }
      
      this.privateState.connectionStatus.loading=false;
    },
    optionList(details: Record<string,any>): Record<string,any> {
      // Return torrent options only
      const result = _.pickBy(details, (value, key) => this.privateState.optionKeys.includes(key));
      result.fileStats = _.map(details.fileStats, (f) => {
        return {
          priority:f.priority,
          wanted:f.wanted
        }
      });
      return result;
    },
    async saveDetails() {
      const loading = await loadingController.create({});
      await loading.present();
      
      const args: Record<string,any>={};
      
      this.privateState.optionKeys.forEach((key) => {
        args[key]=this.privateState.newOptions[key];
      });

      if(UserSettings.state.useBits){
        // Bits to bytes
        args.downloadLimit = Math.round(args.downloadLimit/8);
        args.uploadLimit = Math.round(args.uploadLimit/8);
      }

      const wanted=[];
      const unwanted=[];
      const priorityHigh=[];
      const priorityLow=[];
      const priorityNormal=[];

      for(const file in this.privateState.newOptions.fileStats){
        const id = parseInt(file);

        if(this.privateState.newOptions.fileStats[file].wanted){
          wanted.push(id);
        }
        else {
          unwanted.push(id);
        }

        switch (this.privateState.newOptions.fileStats[file].priority) {
          case 1:
            priorityHigh.push(id);
            break;
          case -1:
            priorityLow.push(id);
            break;
          default:
            priorityNormal.push(id);
            break;
        }
      }

      if(wanted.length>0){
        args["files-wanted"]=wanted;
      }
      if(unwanted.length>0){
        args["files-unwanted"]=unwanted;
      }
      if(priorityHigh.length>0){
        args["priority-high"]=priorityHigh;
      }
      if(priorityLow.length>0){
        args["priority-low"]=priorityLow;
      }
      if(priorityNormal.length>0){
        args["priority-normal"]=priorityNormal;
      }

      await TransmissionRPC.torrentAction("set",this.id,args)
        .then((response) => {
          Utils.responseToast(response.result)
          this.privateState.modified=false;
        })
        .catch((error) => {
          Utils.responseToast(error.message);
        })

      loading.dismiss();
    },
    async torrentActions() {
      let buttons = [
        {
          text: Locale.formatString(Locale.actions.startNow).toString(),
          handler: () => this.torrentAction("start-now",this.id)
        },
        {
          text: Locale.actions.setLocation,
          handler: async () => {
            actionSheetController.dismiss();
            this.setLocation()
          }
        },
        {
          text: Locale.actions.openInExplorer,
          handler: () => this.openExplorer()
        },
        {
          text: Locale.actions.copyMagnet,
          handler: () => this.copyMagnet()
        },
        {
          text: Locale.actions.reannonce,
          handler: () => this.torrentAction("reannounce",this.id)
        },
        {
          text: Locale.actions.verify,
          handler: () => this.torrentAction("verify",this.id)
        },
        {
          text: Locale.actions.remove,
          role: 'destructive',
          handler: async()  => {
            actionSheetController.dismiss();
            this.removeTorrents();
          },
        },
        {
          text: Locale.actions.cancel,
          role: 'cancel'
        },
      ]

      if(!isPlatform("electron")){
        buttons.splice(2, 1);
      }

      const actionSheet = await actionSheetController
        .create({
          buttons: buttons,
        });
      return actionSheet.present();
    },
    copyMagnet() {
      Utils.clipboardCopy(this.privateState.details.magnetLink)
        .then(() => {
          Utils.responseToast("success");
        }).catch((error) => {
          Utils.responseToast(error)
        })
    },
    torrentAction(action: string, torrentIds: Array<number>){
      TransmissionRPC.torrentAction(action,torrentIds)
        .then((response) => {
          Utils.responseToast(response.result)
          this.privateState.details.status=Utils.actionStatusResult(action,this.privateState.details.status,this.privateState.details.percentDone);
        })
        .catch((error) => {
          Utils.responseToast(error.message);
        })
    },
    async removeTorrents(){
      const alert = await alertController
        .create({
          header: Locale.prompt.confirmation,
          message: Locale.formatString(Locale.prompt.remove,`"${this.privateState.details.name}"`) as string,
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
                TransmissionRPC.torrentAction("remove",[this.id],{'delete-local-data':data.includes("deleteData")})
                  .then(async (response) => {
                    Utils.responseToast(response.result);
                    this.modalClose();
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
    openExplorer() {
      let isFile = false;
      let path = this.privateState.details.name;
      const directory = this.privateState.details.downloadDir;

      if(this.privateState.details.files.length===1){
        path = this.privateState.details.files[0].name
        isFile = true;
      }

      FileHandler.openExplorer(directory,path,isFile)
    },
    async setLocation() {
      const modal = await modalController
        .create({
          component: LocationAlert,
          cssClass:"location-alert",
          enterAnimation:isPlatform("ios") ? iosEnterAnimation : mdEnterAnimation,
          leaveAnimation:isPlatform("ios") ? iosLeaveAnimation : mdLeaveAnimation,
          componentProps: {
            value:this.privateState.details.downloadDir,
          }
        })
      modal.onDidDismiss()
        .then((result) => {
          if(result.data){
            TransmissionRPC.torrentAction("set-location",[this.id],result.data)
              .then(async (response) => {
                Utils.responseToast(response.result);
                this.privateState.details.downloadDir=result.data.location;
              })
              .catch((error) => {
                Utils.responseToast(error.message);
              })
          }
        })
      return modal.present();
    },
    changeDirectory(directory: string) {
      this.privateState.currentDirectory=directory;
    },
    modalClose() {
      modalController.dismiss();
    },
    switchTorrentState() {
      Emitter.emit('switch', this.id)
      this.privateState.details.status = this.privateState.details.status==0 ? 6 : 0
    }
  },
  beforeUnmount() {
    clearInterval(this.privateState.refreshInterval);
  }
});
</script>