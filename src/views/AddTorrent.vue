<template>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="#" @click="modalClose()"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ multiple ? Locale.addTorrents : Locale.addTorrent }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="add()" fill="clear" :disabled="!connectionStatus.connected" :aria-label="Locale.add">
            <ion-icon slot="icon-only" :ios="checkmarkOutline" :md="checkmarkSharp"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment ref="tabs" @ionChange="tabController.setTab($event.detail.value)" v-model="tabController.state.selectedTab" scrollable>
          <ion-segment-button :value="0" id="tab1">
            <ion-label>{{ Locale.general }}</ion-label>
          </ion-segment-button>
          <ion-segment-button :value="1" v-if="!multiple" :disabled="!data.files" id="tab2">
            <ion-label>{{ Locale.files }}</ion-label>
          </ion-segment-button>
          <ion-segment-button :value="1" v-else id="tab2">
            <ion-label class="text-transform">{{ Locale.torrent.other }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ConnectionStatus 
      v-if="connectionStatus.loading || connectionStatus.error!=''"
      v-on:retry="retry()">
    </ConnectionStatus>

    <div class="swiper" ref="swiper" v-show="connectionStatus.connected">
      <div class="swiper-wrapper">
        <!-- General tab --> 
        <div class="swiper-slide" role="tabpanel" aria-labelledby="tab1" :aria-hidden="tabController.state.selectedTab!=0">

          <ion-content class="ion-padding" ref="content">

            <ion-list>
              <ion-list-header>
                <ion-label>
                  {{ Locale.preset }}
                </ion-label>
              </ion-list-header>

              <div id="presets" class="swiper-no-swiping">

                <ion-chip @click="addPreset()">
                  <ion-label>{{ Locale.add }}</ion-label>
                  <ion-icon :ios="addCircleOutline" :md="addCircleSharp"></ion-icon>
                </ion-chip>

                <ion-chip v-for="(preset,name) in presets" :key="name" @click="selectPreset(name)" :color="selectedPreset==name ? 'primary' : null">
                  <ion-label>{{name}}</ion-label>
                  <ion-icon :ios="closeCircleOutline" :md="closeCircleSharp" @click="removePreset(name,$event)"></ion-icon>
                </ion-chip>
              </div>
            </ion-list>

            <ion-list>
              <ion-list-header>
                <ion-label>
                  {{ Locale.options }}
                </ion-label>
              </ion-list-header>

              <ion-item class="autocomplete" v-if="connectionStatus.connected">
                <ion-label position="floating">{{ Locale.downloadDir }}</ion-label>
                <autocomplete 
                  :value="settings.downloadDir"
                  :items="TransmissionRPC.persistentData.downloadDir"
                  :placeholder="defaultDownloadDir"
                  v-on:update="setDownloadDir">
                </autocomplete>
              </ion-item>

              <ion-item>
                <ion-label>{{ Locale.actions.start }}</ion-label>
                <span class="swiper-no-swiping" slot="end">
                  <ion-toggle v-model="settings.start"></ion-toggle>
                </span>
              </ion-item>

              <ion-item>
                <ion-label>
                  {{ Locale.priority.priority }}
                </ion-label>
                <ion-select placeholder="Select One" v-model="settings.bandwidthPriority" :okText="Locale.ok" :cancelText="Locale.actions.cancel">
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

                <ion-item v-if="multiple">
                  <ion-label class="label no-wrap">
                    <div class="text-transform">{{ Locale.torrent.other }}</div>
                    <span class="selectable">{{files.length}}</span>
                  </ion-label>
                </ion-item>

                <ion-item v-if="type=='url'">
                  <ion-label class="label no-wrap">
                    <div>URL</div>
                    <span class="selectable">{{files[0].torrent}}</span>
                  </ion-label>
                </ion-item>

                <ion-item v-if="data.name">
                  <ion-label class="label no-wrap">
                    <div>{{ Locale.name }}</div>
                    <span class="selectable">{{data.name}}</span>
                  </ion-label>
                </ion-item>

                <ion-item v-if="totalSize">
                  <ion-label class="label">
                    <div>{{ Locale.totalSize }}</div>
                    <span class="selectable">{{Utils.formatBytes(totalSize)}}</span>
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
                    <span class="selectable" v-html="Utils.autoLink(data.comment)"></span>
                  </ion-label>
                </ion-item>

                <ion-item v-if="data.infoHash">
                  <ion-label class="label no-wrap">
                    <div>{{ Locale.hash }}</div>
                    <span class="selectable">{{data.infoHash}}</span>
                  </ion-label>
                </ion-item>

                <ion-item v-if="data.announce && data.announce.length>0">
                  <ion-label class="label no-wrap">
                    <div>{{ Locale.tracker.one }}</div>
                    <span class="selectable">{{ Utils.trackerDomain(data.announce[0]).domain }}</span>
                  </ion-label>
                </ion-item>
              </p>

            </ion-list>
          </ion-content>

        </div>
        <!-- Files tab -->
        <div class="swiper-slide" v-if="!multiple && data.files" role="tabpanel" aria-labelledby="tab2" :aria-hidden="tabController.state.selectedTab!=1">
          <Files :actions="false" v-on:changeDirectory="changeDirectory"></Files>
        </div>
        <!-- Torrents tab -->
        <div class="swiper-slide" v-if="multiple" role="tabpanel" aria-labelledby="tab2" :aria-hidden="tabController.state.selectedTab!=1">
          <VirtualScroll v-bind="$attrs" :items="files" :item-size="64" key-field="data.infoHash">
            <template v-slot:default="{item}">
              <div class="torrent">
                <div class="side">
                  <ion-checkbox
                    v-bind="checkedAttributes(item.data.infoHash)"
                    v-on:ionChange="checboxUpdate($event,item.data.infoHash)">
                  </ion-checkbox>
                </div>
                <div class="middle" @click="fileTitle(item.data.name)" @contextmenu="fileTitle(item.data.name, $event)">
                  <div class="name">
                    {{item.data.name}}
                  </div>
                  <div class="details">
                    <ion-icon color="medium" :ios="documentOutline" :md="documentSharp"></ion-icon>

                    {{ Utils.formatBytes(item.data.length) }}
                  </div>
                </div>
              </div>
            </template>
          </VirtualScroll>
        </div>
      </div>
    </div>
    
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { 
  modalController,
  alertController,
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
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonCheckbox,
  IonChip
} from '@ionic/vue';
import {
  checkmarkOutline,
  checkmarkSharp,
  documentOutline,
  documentSharp,
  closeCircleOutline,
  closeCircleSharp,
  addCircleOutline,
  addCircleSharp
} from 'ionicons/icons';
import ConnectionStatus from './components/ConnectionStatus.vue';
import Autocomplete from './components/Autocomplete.vue';
import VirtualScroll from './components/VirtualScroll.vue';
import Files from './components/Files.vue';
import Preset from './Preset.vue';
import TabController from '../services/TabController';
import { Utils } from "../services/Utils";
import { Locale } from "../services/Locale";
import { Emitter } from "../services/Emitter";
import { TransmissionRPC } from "../services/TransmissionRPC";
import { UserSettings } from '../services/UserSettings';
import * as _ from 'lodash';

export default defineComponent({
  name: 'AddTorrent',
  props: ["files","type"],
  inject: ["connectionStatus"],
  components: { 
    ConnectionStatus,
    Autocomplete,
    Files,
    VirtualScroll,
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
    IonToggle,
    IonSelect,
    IonSelectOption,
    IonIcon,
    IonCheckbox,
    IonChip,
  },
  data() {
    return {
      settings:{
        start:true,
        bandwidthPriority:0,
        downloadDir:"",
      },
      autocompleteOpen:false,
      defaultDownloadDir:"",
      currentDirectory:"",
      fileStats:[] as Array<any>,
      notWanted:[] as Array<string>,
      presets:{} as Record<string,any>,
      selectedPreset:""
    }
  },
  computed: {
    multiple(): boolean {
      return this.files.length>1
    },
    data(): Record<string,any> {
      return this.multiple ? {} : this.files[0].data;
    },
    totalSize(): number|null {
      let result=0;
      this.files.forEach((file: Record<string,any>) => {
        result=result+file.data.length
      })
      return result>0 ? result : null;
    }
  },
  provide() {
    return {
      id: -1,
      details: this.data,
      fileStats: this.data.files,
      currentDirectory: computed(() => this.currentDirectory)
    } 
  },
  setup() {
    Utils.pushState();
    
    const tabController = new TabController();

    return { 
      Locale,
      Utils,
      tabController,
      TransmissionRPC,
      checkmarkOutline,
      checkmarkSharp,
      documentOutline,
      documentSharp,
      closeCircleOutline,
      closeCircleSharp,
      addCircleOutline,
      addCircleSharp
    }
  },
  async created() {
    if(!this.multiple && this.data.files){
      this.fileStats = _.clone(this.data.files);
      this.fileStats.forEach((file: Record<string,any>) => {
        file.wanted=true;
        file.name=file.path;
      });
    }

    this.presets = await UserSettings.loadPresets();
    this.defaultDownloadDir = await TransmissionRPC.getSessionArgument('download-dir')
  },
  mounted() {
    Utils.customScrollbar(this.$refs.content);

    this.tabController.init(this.$refs.swiper, this.$refs.tabs);
  },
  methods: {
    modalClose() {
      modalController.dismiss();
    },
    retry() {
      Emitter.emit("refresh",true);
    },
    changeDirectory(directory: string) {
      this.currentDirectory=directory;
    },
    setDownloadDir(directory: string) {
      this.settings.downloadDir=directory;
    },
    fileTitle(title: string, e?: Event){
      if(e){
        e.preventDefault();
      }
      Utils.responseToast(title)
    },
    checkedAttributes(hash: string) {
      return {
        checked:!this.notWanted.includes(hash)
      }
    },
    checboxUpdate(e: any, hash: string) {
      if(e.detail.checked){
        this.notWanted.splice(this.notWanted.indexOf(hash), 1);
      }
      else {
        this.notWanted.push(hash)
      }
    },
    async add(){
      let error = false;

      const args = {
        paused:!this.settings.start
      } as Record<string,any>;
      
      if(this.settings.downloadDir!=""){
        args["download-dir"]=this.settings.downloadDir;
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
      
      await this.sendFiles(args)
        .catch((e: Error) => {
          Utils.responseToast(e.message);
          error = true;
        });

      await loading.dismiss();

      if(!error){
        Utils.responseToast("success");
        this.modalClose();
      }
    },
    async sendFiles(args: Record<string,any>){
      for(const torrentFile of this.files) {
        if(!this.notWanted.includes(torrentFile.data.infoHash)){
          await this.send(args,torrentFile.torrent)
            .then(async (result) => {
              await this.applyPreset(result.arguments);
            })
            .catch((e) => {
              throw new Error(this.multiple ? `${e.message}: ${torrentFile.data.name}` : e.message);
            })
        }
      }
    },
    send(args: Record<string,any>,torrent:string) {
      switch (this.type) {
        case "magnet":
        case "url":
          args.filename=torrent
          break;
        case "file":
          args.metainfo=torrent
          break;
      }

      return TransmissionRPC.torrentAdd({...this.settings, ...args});
    },
    selectPreset(name: string){
      this.selectedPreset = this.selectedPreset==name ? "" : name;
      if(this.selectedPreset!=""){
        this.settings = {...this.presets[name]};
      }
      else {
        this.settings = {
          start:true,
          bandwidthPriority:0,
          downloadDir:""
        }
      }
    },

    async applyPreset(args: Record<string,any>) {
      if(args["torrent-added"] && this.presets[this.selectedPreset]){
        if(this.presets[this.selectedPreset].other.downloadLimited || this.presets[this.selectedPreset].other.uploadLimited){
          await TransmissionRPC.torrentAction("set",[args["torrent-added"].id],this.presets[this.selectedPreset].other)
            .catch((error) => {
              Utils.responseToast(error.message);
            })
        }
      }
    },

    async addPreset() {
      const modal = await modalController
        .create({
          component: Preset
        })
      modal.onDidDismiss()
          .then(async () => {
            this.presets = await UserSettings.loadPresets();
          })
      return modal.present();
    },
    async removePreset(name: string, e: Event) {
      e.stopPropagation();
      const alert = await alertController
        .create({
          header: Locale.prompt.confirmation,
          message: Locale.formatString(Locale.prompt.delete,`"${name}"`) as string,
          buttons: [
            {
              text: Locale.actions.cancel,
              role: 'cancel'
            },
            {
              text: Locale.prompt.confirm,
              handler: () => {
                delete this.presets[name];
                UserSettings.savePresets(this.presets);
              },
            },
          ],
        });
      return alert.present();
    }
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

.torrent {
  height:64px;
  border-bottom: 1px solid var(--ion-border-color);
  text-align:left;
}

.torrent > div {
  padding:5px;
  vertical-align: top;
}

.side {
  height:64px;
  width:50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.side ion-icon {
  font-size:20px;
  margin: 18px 0px;
}

.middle {
  position:relative;
  display:inline-block;
  height:64px;
  width:calc(100% - 50px);
}

.name {
  font-size:1rem;
  line-height: 1.2rem;
  height: 38px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.details {
  font-size: 14px;
  color:var(--ion-color-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.details ion-icon {
  vertical-align: -2px;
}
</style>