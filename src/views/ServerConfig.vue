<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-back-button defaultHref="#" @click="modalClose()"></ion-back-button>
      </ion-buttons>
      <ion-title>{{ Locale.serverConfig }}</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="saveSettings()" fill="clear">
          <ion-icon slot="icon-only" :ios="saveOutline" :md="saveSharp"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
    <ion-toolbar>
      <ion-segment ref="tabs" @ionChange="setTab($event.detail.value)" v-model="selectedTab" scrollable>
        <ion-segment-button :value="0" ref="segment-0">
          <ion-label>{{ Locale.download }}</ion-label>
        </ion-segment-button>
        <ion-segment-button :value="1" ref="segment-1">
          <ion-label>{{ Locale.limits }}</ion-label>
        </ion-segment-button>
        <ion-segment-button :value="2" ref="segment-2">
          <ion-label>{{ Locale.network }}</ion-label>
        </ion-segment-button>
      </ion-segment>
    </ion-toolbar>
  </ion-header>
  
  <ion-slides pager='false' ref="slider" :options="slidesOptions" v-on:ionSlideTransitionEnd="slideChanged">
    <!-- Download tab -->
    <ion-slide>
      <ion-content class="ion-padding" ref="tab1">
        <ion-list>
          <ion-list-header>
            <ion-label>
              {{ Locale.general }}
            </ion-label>
          </ion-list-header>

          <ion-item>
            <ion-label position="floating">{{ Locale.defaultDownloadDir }}</ion-label>
            <ion-input v-model="config['download-dir']"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="floating">{{ Locale.cacheSize }} (M{{ Locale.units.byte }})</ion-label>
            <ion-input v-model.number="config['cache-size-mb']" type="number"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label>{{ Locale.startAddedTorrents }}</ion-label>
            <ion-toggle v-model="config['start-added-torrents']" slot="end" class="swiper-no-swiping"></ion-toggle>
          </ion-item>
        </ion-list>

        <ion-list>
          <ion-list-header>
            <ion-label>
              {{ Locale.queue }}
            </ion-label>
          </ion-list-header>

          <ion-item>
            <ion-label>{{ Locale.enabled }}</ion-label>
            <ion-toggle v-model="config['download-queue-enabled']" slot="end" class="swiper-no-swiping"></ion-toggle>
          </ion-item>

          <ion-item :disabled="!config['download-queue-enabled']">
            <ion-label position="floating">{{ Locale.queueSize }}</ion-label>
            <ion-input v-model="config['download-queue-size']"></ion-input>
          </ion-item>

          <ion-item>
            <div class="left">
              <ion-label position="floating">
                {{ Locale.stopWhenInactive }}
              </ion-label>
              <ion-input v-model.number="config['queue-stalled-minutes']" type="number" :disabled="!config['queue-stalled-enabled']"></ion-input>
            </div>
            <ion-toggle v-model="config['queue-stalled-enabled']" slot="end" class="swiper-no-swiping"></ion-toggle>
          </ion-item>
        </ion-list>

        <ion-list>
          <ion-list-header>
            <ion-label>
              {{ Locale.incompleteDownloads }}
            </ion-label>
          </ion-list-header>

          <ion-item>
            <ion-label>{{ Locale.addPartExt }}</ion-label>
            <ion-toggle v-model="config['rename-partial-files']" slot="end" class="swiper-no-swiping"></ion-toggle>
          </ion-item>

          <ion-item>
            <ion-label>{{ Locale.useTempDir }}</ion-label>
            <ion-toggle v-model="config['incomplete-dir-enabled']" slot="end" class="swiper-no-swiping"></ion-toggle>
          </ion-item>

          <ion-item :disabled="!config['incomplete-dir-enabled']">
            <ion-label position="floating">{{ Locale.tempDirPath }}</ion-label>
            <ion-input v-model="config['incomplete-dir']"></ion-input>
          </ion-item>
        </ion-list>

      </ion-content>

    </ion-slide>

    <!-- Limits tab -->
    <ion-slide>
      <ion-content class="ion-padding" ref="tab2">

        <ion-list>
          <ion-list-header>
            <ion-label>
              {{ Locale.bandwidth }}
            </ion-label>
          </ion-list-header>

          <ion-item>
            <div class="left">
              <ion-label position="floating">
                {{ Locale.downloadLimit }} ({{ speedUnit }})
              </ion-label>
              <ion-input v-model.number="config['speed-limit-down']" type="number" :disabled="!config['speed-limit-down-enabled']"></ion-input>
            </div>
            <ion-toggle v-model="config['speed-limit-down-enabled']" slot="end" class="swiper-no-swiping"></ion-toggle>
          </ion-item>
          
          <ion-item>
            <div class="left">
              <ion-label position="floating">
                {{ Locale.uploadLimit }} ({{ speedUnit }})
              </ion-label>
              <ion-input v-model.number="config['speed-limit-up']" type="number" :disabled="!config['speed-limit-up-enabled']"></ion-input>
            </div>
            <ion-toggle v-model="config['speed-limit-up-enabled']" slot="end" class="swiper-no-swiping"></ion-toggle>
          </ion-item>
        </ion-list>

        <ion-list>
          <ion-list-header>
            <ion-label>
              {{ Locale.altSpeed }}
            </ion-label>
          </ion-list-header>

          <ion-item>
            <ion-label>{{ Locale.enabled }}</ion-label>
            <ion-toggle v-model="config['alt-speed-enabled']" slot="end" class="swiper-no-swiping"></ion-toggle>
          </ion-item>

          <ion-item>
            <ion-label position="floating">{{ Locale.downloadLimit }} ({{ speedUnit }})</ion-label>
            <ion-input v-model.number="config['alt-speed-down']" type="number"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="floating">{{ Locale.uploadLimit }} ({{ speedUnit }})</ion-label>
            <ion-input v-model.number="config['alt-speed-up']" type="number"></ion-input>
          </ion-item>
        </ion-list>

        <ion-list>
          <ion-list-header>
            <ion-label>
              {{ Locale.seed }}
            </ion-label>
          </ion-list-header>

          <ion-item>
            <div class="left">
              <ion-label position="floating">
                {{ Locale.seedRatioLimit }}
              </ion-label>
              <ion-input v-model.number="config.seedRatioLimit" type="number" :disabled="!config.seedRatioLimited"></ion-input>
            </div>
            <ion-toggle v-model="config.seedRatioLimited" slot="end" class="swiper-no-swiping"></ion-toggle>
          </ion-item>

          <ion-item>
            <div class="left">
              <ion-label position="floating">
                {{ Locale.stopWhenInactive }}
              </ion-label>
              <ion-input v-model.number="config['idle-seeding-limit']" type="number" :disabled="!config['idle-seeding-limit-enabled']"></ion-input>
            </div>
            <ion-toggle v-model="config['idle-seeding-limit-enabled']" slot="end" class="swiper-no-swiping"></ion-toggle>
          </ion-item>
        </ion-list>

        <ion-list>
          <ion-list-header>
            <ion-label>
              {{ Locale.peer.other }}
            </ion-label>
          </ion-list-header>

          <ion-item>
            <ion-label position="floating">
              {{ Locale.globalPeerLimit }}
            </ion-label>
            <ion-input v-model.number="config['peer-limit-global']" type="number"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="floating">
              {{ Locale.peerLimitByTorrent }}
            </ion-label>
            <ion-input v-model.number="config['peer-limit-per-torrent']" type="number"></ion-input>
          </ion-item>
        </ion-list>

      </ion-content>
    </ion-slide>

    <!-- Network tab -->
    <ion-slide>
      <ion-content class="ion-padding" ref="tab3">
        <ion-list>
          <ion-list-header>
            <ion-label>
              {{ Locale.general }}
            </ion-label>
          </ion-list-header>

          <ion-item>
            <ion-label>{{ Locale.encryption }}</ion-label>
            <ion-select placeholder="Select One" :value="config.encryption" v-on:ionChange="config.encryption=$event.target.value" :cancelText="Locale.actions.cancel"> 
              <ion-select-option value="required">{{ Locale.required }}</ion-select-option>
              <ion-select-option value="preferred">{{ Locale.preferred }}</ion-select-option>
              <ion-select-option value="tolerated">{{ Locale.tolerated }}</ion-select-option>
            </ion-select>
          </ion-item>
        </ion-list>

        <ion-list>
          <ion-list-header>
            <ion-label>
              {{ Locale.peerPort }}
            </ion-label>
          </ion-list-header>

          <ion-item :disabled="config['peer-port-random-on-start']">
            <ion-label position="floating">{{ Locale.port }}</ion-label>
            <ion-input v-model.number="config['peer-port']" type="number"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label>{{ Locale.randomPortOnStart }}</ion-label>
            <ion-toggle v-model="config['peer-port-random-on-start']" slot="end" class="swiper-no-swiping"></ion-toggle>
          </ion-item>

          <ion-item>
            <ion-label>{{ Locale.portForwarding }}</ion-label>
            <ion-toggle v-model="config['port-forwarding-enabled']" slot="end" class="swiper-no-swiping"></ion-toggle>
          </ion-item>
        </ion-list>

        <ion-list>
          <ion-list-header>
            <ion-label>
              {{ Locale.protocols }}
            </ion-label>
          </ion-list-header>

          <ion-item>
            <ion-label>{{ Locale.DHT }} (DHT)</ion-label>
            <ion-toggle v-model="config['dht-enabled']" slot="end" class="swiper-no-swiping"></ion-toggle>
          </ion-item>

          <ion-item>
            <ion-label>{{ Locale.LPD }} (LPD)</ion-label>
            <ion-toggle v-model="config['ldp-enabled']" slot="end" class="swiper-no-swiping"></ion-toggle>
          </ion-item>

          <ion-item>
            <ion-label>{{ Locale.PEX }} (PEX)</ion-label>
            <ion-toggle v-model="config['pex-enabled']" slot="end" class="swiper-no-swiping"></ion-toggle>
          </ion-item>

          <ion-item>
            <ion-label>{{ Locale.UTP }} (µTP)</ion-label>
            <ion-toggle v-model="config['utp-enabled']" slot="end" class="swiper-no-swiping"></ion-toggle>
          </ion-item>
        </ion-list>

        <ion-list>
          <ion-list-header>
            <ion-label>
              {{ Locale.blocklist }}
            </ion-label>
          </ion-list-header>

          <ion-item>
            <ion-label>{{ Locale.enabled }}</ion-label>
            <ion-toggle v-model="config['blocklist-enabled']" slot="end" class="swiper-no-swiping"></ion-toggle>
          </ion-item>

          <ion-item :disabled="!config['blocklist-enabled']">
            <ion-label position="floating">{{ Locale.blocklistUrl }}</ion-label>
            <ion-input v-model.number="config['blocklist-url']"></ion-input>
          </ion-item>

          <ion-item>
            <ion-button size="default" @click="updateBlocklist()">{{ Locale.updateBlocklist }}</ion-button>
          </ion-item>
        </ion-list>

      </ion-content>
    </ion-slide>
  </ion-slides>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { 
  isPlatform,
  modalController,
  loadingController,
  IonContent,
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSegment,
  IonSegmentButton,
  IonSlides,
  IonSlide,
  IonList,
  IonIcon,
  IonButton,
  IonLabel,
  IonListHeader,
  IonItem,
  IonInput,
  IonToggle,
  IonSelect,
  IonSelectOption
} from '@ionic/vue';
import {
  saveOutline,
  saveSharp
} from 'ionicons/icons';
import { TransmissionRPC } from "../services/TransmissionRPC";
import { UserSettings } from "../services/UserSettings";
import { Utils } from "../services/Utils";
import { Locale } from "../services/Locale";
import * as _ from 'lodash';

export default defineComponent({
  name: 'Server configuration',
  components: { 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonSegment,
    IonSegmentButton,
    IonSlides,
    IonSlide,
    IonList,
    IonIcon,
    IonButton,
    IonLabel,
    IonListHeader,
    IonItem,
    IonInput,
    IonToggle,
    IonSelect,
    IonSelectOption
  },
  data() {
    return {
      config: _.clone(TransmissionRPC.sessionArguments),
      selectedTab:0,
    }
  },
  setup() {
    Utils.pushState();

    return { 
      Locale,
      Utils,
      saveOutline,
      saveSharp
    }
  },
  created() {
    if(UserSettings.state.useBits){
      // Bytes to bits
      this.config['alt-speed-up'] = this.config['alt-speed-up']*8;
      this.config['alt-speed-down'] = this.config['alt-speed-down']*8;
      this.config['speed-limit-up'] = this.config['speed-limit-up']*8;
      this.config['speed-limit-down'] = this.config['speed-limit-down']*8;
    }
  },
  async mounted() {
    Utils.customScrollbar(this.$refs.tab1)
    Utils.customScrollbar(this.$refs.tab2)
    Utils.customScrollbar(this.$refs.tab3)

    setTimeout(()=>{
      // Workaround to fix SwiperJS when opening/closing modal multiple times
      const slider = this.$refs.slider as Record<string,any>;
      slider.$el.update()
    },100)
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
    speedUnit:() => {
      return 'K' + (UserSettings.state.useBits ? Locale.units.bit : Locale.units.byte) + Locale.units.perSecond
    }
  },
  methods: {
    modalClose () {
      modalController.dismiss();
    },
    async updateBlocklist() {
      const loading = await loadingController.create({});
      await loading.present();
      await TransmissionRPC.rpcCall("blocklist-update")
        .then((response) => {
          const size = response.arguments['blocklist-size'].toLocaleString(UserSettings.getLanguage());
          Utils.responseToast(Locale.formatString(Locale.blocklistSize,size).toString());
        })
        .catch((error) => {
          Utils.responseToast(error.message);
        })
      loading.dismiss();
    },
    async saveSettings() {
      const loading = await loadingController.create({});
      await loading.present();

      const tmpArgs = _.clone(this.config)
      const args: Record<string,any>={};

      if(UserSettings.state.useBits){
        // Bits to bytes
        tmpArgs['alt-speed-up'] = Math.round(tmpArgs['alt-speed-up']/8);
        tmpArgs['alt-speed-down'] = Math.round(tmpArgs['alt-speed-down']/8);
        tmpArgs['speed-limit-up'] = Math.round(tmpArgs['speed-limit-up']/8);
        tmpArgs['speed-limit-down'] = Math.round(tmpArgs['speed-limit-down']/8);
      }

      for(const key in tmpArgs){
        if(!_.isEqual(tmpArgs[key],TransmissionRPC.sessionArguments[key])){
          args[key]=tmpArgs[key];
        }
      }
      
      await TransmissionRPC.setSession(args)
        .then((response)=> {
          Utils.responseToast(response.result)
        })
      loading.dismiss()
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

.left {
  position: absolute;
  bottom: 0px;
}

div[slot="start"]{
  max-width: calc(100% - 68px);
  margin-inline-end:0px;
}
</style>