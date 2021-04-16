<template>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="#" @click="modalClose()"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ Locale.addTorrent }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="add()" fill="clear" :disabled="!connectionStatus.connected">
            <ion-icon slot="icon-only" :ios="checkmarkOutline" :md="checkmarkSharp"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment ref="tabs" @ionChange="setTab($event.detail.value)" v-model="selectedTab" scrollable>
          <ion-segment-button :value="0" ref="segment-0">
            <ion-label>{{ Locale.general }}</ion-label>
          </ion-segment-button>
          <ion-segment-button :value="1" ref="segment-1" :disabled="!data.files">
            <ion-label>{{ Locale.files }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ConnectionStatus 
      v-if="connectionStatus.loading || connectionStatus.error!=''"
      v-on:retry="retry()">
    </ConnectionStatus>

    <ion-slides v-show="connectionStatus.connected" ref="slider" :options="slidesOptions" v-on:ionSlideTransitionEnd="slideChanged">
      <ion-slide>

        <ion-content class="ion-padding" ref="content">
          <ion-list>
            <ion-list-header>
              <ion-label>
                {{ Locale.options }}
              </ion-label>
            </ion-list-header>

            <ion-item class="autocomplete" v-if="connectionStatus.connected">
              <ion-label position="floating">{{ Locale.downloadDir }}</ion-label>
              <autocomplete 
                :items="TransmissionRPC.persistentData.downloadDir"
                :placeholder="defaultDownloadDir"
                v-on:update="setDownloadDir">
              </autocomplete>
            </ion-item>

            <ion-item>
              <ion-label>{{ Locale.startTorrent }}</ion-label>
              <ion-toggle :checked="!settings.paused" v-on:ionChange="settings.paused=!settings.paused" class="swiper-no-swiping"></ion-toggle>
            </ion-item>

            <ion-item>
              <ion-label>
                {{ Locale.priority.priority }}
              </ion-label>
              <ion-select placeholder="Select One" :value="settings.bandwidthPriority" v-on:ionChange="settings.bandwidthPriority=$event.target.value" :cancelText="Locale.actions.cancel">
                <ion-select-option :value="1">{{ Locale.priority.high }}</ion-select-option>
                <ion-select-option :value="0">{{ Locale.priority.normal }}</ion-select-option>
                <ion-select-option :value="-1">{{ Locale.priority.low }}</ion-select-option>
              </ion-select>
            </ion-item>

            <p>
              <ion-list-header>
                <ion-label>
                  {{ Locale.informations }}
                </ion-label>
              </ion-list-header>

              <ion-item v-if="type=='url'">
                <ion-label class="label no-wrap">
                  <div>URL</div>
                  <span class="selectable">{{torrent}}</span>
                </ion-label>
              </ion-item>

              <ion-item v-if="data.name">
                <ion-label class="label no-wrap">
                  <div>{{ Locale.name }}</div>
                  <span class="selectable">{{data.name}}</span>
                </ion-label>
              </ion-item>

              <ion-item v-if="data.length">
                <ion-label class="label">
                  <div>{{ Locale.totalSize }}</div>
                  <span class="selectable">{{Utils.formatBytes(data.length)}}</span>
                </ion-label>
              </ion-item>

              <ion-item v-if="data.files">
                <ion-label class="label">
                  <div>{{ Locale.files }}</div>
                  <span class="selectable">{{ data.files.length }}</span>
                </ion-label>
              </ion-item>

              <ion-item v-if="data.length && data.pieceLength">
                <ion-label class="label">
                  <div>{{ Locale.pieces }}</div>
                  <span class="selectable">{{ Math.ceil(data.length/data.pieceLength) }} x {{ Utils.formatBytes(data.pieceLength) }}</span>
                </ion-label>
              </ion-item>
              
              <ion-item v-if="data.comment">
                <ion-label class="label no-wrap">
                  <div>{{ Locale.comment }}</div>
                  <span class="selectable">{{data.comment}}</span>
                </ion-label>
              </ion-item>

              <ion-item v-if="data.infoHash">
                <ion-label class="label no-wrap">
                  <div>{{ Locale.hash }}</div>
                  <span class="selectable">{{data.infoHash}}</span>
                </ion-label>
              </ion-item>

              <ion-item v-if="data.announce">
                <ion-label class="label no-wrap">
                  <div>{{ Locale.tracker.one }}</div>
                  <span class="selectable">{{data.announce.length>0 ? Utils.trackerDomain(data.announce[0]).domain : null}}</span>
                </ion-label>
              </ion-item>
            </p>

          </ion-list>
        </ion-content>

      </ion-slide>
      <ion-slide v-if="data.files">
        <Files :actions="false" v-on:changeDirectory="changeDirectory"></Files>
      </ion-slide>
    </ion-slides>
    
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { 
  isPlatform,
  modalController,
  loadingController,
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButton,
  IonButtons,
  IonBackButton,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSlides,
  IonSlide,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonIcon
} from '@ionic/vue';
import {
  checkmarkOutline,
  checkmarkSharp
} from 'ionicons/icons';
import ConnectionStatus from './components/ConnectionStatus.vue';
import Autocomplete from './components/Autocomplete.vue';
import Files from './components/Files.vue';
import { Utils } from "../services/Utils";
import { Locale } from "../services/Locale";
import { Emitter } from "../services/Emitter";
import { TransmissionRPC } from "../services/TransmissionRPC";
import * as _ from 'lodash';

export default defineComponent({
  name: 'AddTorrent',
  props: ["data","torrent","type"],
  inject: ["connectionStatus"],
  components: { 
    ConnectionStatus,
    Autocomplete,
    Files,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButton,
    IonButtons,
    IonBackButton,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonSlides,
    IonSlide,
    IonToggle,
    IonSelect,
    IonSelectOption,
    IonIcon
  },
  data() {
    return {
      settings:{
        paused:false,
        bandwidthPriority:0
      },
      selectedTab:0,
      autocompleteOpen:false,
      defaultDownloadDir:"",
      downloadDir:"",
      currentDirectory:"",
      fileStats:[] as Array<any>,
    }
  },
  computed: {
    slidesOptions: function(): Record<string,any> {
      return {
        centeredSlides:true,
        initialSlide:this.selectedTab,
        resistanceRatio:isPlatform("ios") ? 0.85 : 0,
        simulateTouch:false
      }
    },
  },
  provide() {
    return {
      id: -1,
      details: this.data,
      fileStats:  this.data.files,
      currentDirectory: computed(() => this.currentDirectory)
    } 
  },
  setup() {
    if (!window.history.state.modal) {
      const modalState = { modal: true };
      history.pushState(modalState, "");
    }

    return { 
      Locale,
      Utils,
      TransmissionRPC,
      checkmarkOutline,
      checkmarkSharp
    }
  },
  async created() {
    if(this.data.files){
      this.fileStats = _.clone(this.data.files);
      this.fileStats.forEach((file: Record<string,any>) => {
        file.wanted=true;
        file.name=file.path;
      });
    }

    this.defaultDownloadDir = await TransmissionRPC.getSessionArgument('download-dir')
  },
  mounted() {
    Utils.customScrollbar(this.$refs.content)
  },
  methods: {
    modalClose() {
      modalController.dismiss();
    },
    retry() {
      Emitter.emit("refresh",true);
    },
    setOpen(state: boolean) {
      this.autocompleteOpen = state;
    },
    changeDirectory(directory: string) {
      this.currentDirectory=directory;
    },
    setDownloadDir(directory: string) {
      this.downloadDir=directory;
    },
    async add(){
      const args = {} as Record<string,any>;
      if(this.downloadDir!=""){
        args["download-dir"]=this.downloadDir;
      }
      switch (this.type) {
        case "magnet":
        case "url":
          args.filename=this.torrent
          break;
        case "file":
          args.metainfo=this.torrent
          break;
      }

      const wanted=[];
      const unwanted=[];

      for(const file in this.fileStats){
        const id = parseInt(file);

        if(this.fileStats[id].wanted){
          wanted.push(id);
        }
        else {
          unwanted.push(id);
        }
      }

      if(wanted.length>0){
        args["files-wanted"]=wanted;
      }
      if(unwanted.length>0){
        args["files-unwanted"]=unwanted;
      }
      
      const loading = await loadingController.create({});
      await loading.present();

      await TransmissionRPC.torrentAdd({...this.settings, ...args})
        .then(async (response) => {
          Utils.responseToast(response.result)
          if(response.result=="success"){
            this.modalClose();
          }
        })
        .catch((error) => {
          Utils.responseToast(error.message)
        })

      loading.dismiss();
    },
    setTab(index: number, smooth=true) {
      const slider = this.$refs.slider as Record<string,any>;
      if(slider){
        slider.$el.slideTo(index);
      }
      else {
        this.selectedTab=index
      }

      const segment = this.$refs[`segment-${index}`] as Record<string,any>;
      segment.$el.scrollIntoView({
        behavior: smooth ? 'smooth' : 'instant',
        block: 'center',
        inline: 'center'
      });
    },
    async slideChanged() {
      const slider = this.$refs.slider as Record<string,any>;
      const activeIndex = await slider.$el.getActiveIndex();
      this.selectedTab=activeIndex;
      this.setTab(activeIndex, false);
    },
  },
});
</script>

<style scoped>
ion-content {
  text-align: initial;
}

p {
  margin-top: 16px;
  margin-bottom: 0px;
}

.autocomplete {
  overflow: visible;
  z-index: 100;
}

.label {
  margin: 8px 0px;
}
.label.no-wrap {
  white-space: normal;
}
.label > div {
  -webkit-transform: translateY(10%) scale(0.75);
  transform: translateY(10%) scale(0.75);
  -webkit-transform-origin: left top;
  transform-origin: left top;
}
.label > span:empty:after {
  content:" ";
  white-space: pre;
}
</style>