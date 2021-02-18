<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="#" @click="modalClose()"></ion-back-button>
        </ion-buttons>
        <ion-title>Server configuration</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="saveSettings()" fill="clear">
            <ion-icon slot="icon-only" :ios="saveOutline" :md="saveSharp"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment ref="tabs" @ionChange="setTab($event.detail.value)" :value="selectedTab" scrollable>
          <ion-segment-button :value="0" ref="segment-0">
            <ion-label>Download</ion-label>
          </ion-segment-button>
          <ion-segment-button :value="1" ref="segment-1">
            <ion-label>Network</ion-label>
          </ion-segment-button>
          <ion-segment-button :value="2" ref="segment-2">
            <ion-label>Bandwith</ion-label>
          </ion-segment-button>
          <ion-segment-button :value="3" ref="segment-3">
            <ion-label>Queue</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>
    <!--<ion-content :fullscreen="true" class="ion-padding">-->
    <ion-slides ref="slider" :options="slidesOptions" v-on:ionSlideTransitionEnd="slideChanged">
      <ion-slide>

        <ion-content class="ion-padding" ref="content">
          <ion-list>
            <ion-list-header>
              <ion-label>
                {{ Locale.options }}
              </ion-label>
            </ion-list-header>

            <ion-item>
              <ion-label position="floating">Default download directory</ion-label>
              <ion-input v-model="config['download-dir']"></ion-input>
            </ion-item>

            <ion-item>
              <div class="left">
                <ion-label position="floating">
                  {{ Locale.seedRatioLimit }}
                </ion-label>
                <ion-input v-model.number="config.seedRatioLimit" type="number"></ion-input>
              </div>
              <ion-toggle v-model="config.seedRatioLimited" slot="end" class="swiper-no-swiping"></ion-toggle>
            </ion-item>
          </ion-list>

          <ion-list>
            <ion-list-header>
              <ion-label>
                Incomplete downloads
              </ion-label>
            </ion-list-header>

            <ion-item>
              <ion-label>Add .part extension to incomplete files</ion-label>
              <ion-toggle v-model="config['rename-partial-files']" slot="end" class="swiper-no-swiping"></ion-toggle>
            </ion-item>
            

            <ion-item>
              <ion-label>Use incomplete directory</ion-label>
              <ion-toggle v-model="config['incomplete-dir-enabled']" slot="end" class="swiper-no-swiping"></ion-toggle>
            </ion-item>

            <ion-item>
              <ion-label position="floating">Incomplete directory</ion-label>
              <ion-input v-model="config['incomplete-dir']"></ion-input>
            </ion-item>
          </ion-list>

        </ion-content>

      </ion-slide>
      <ion-slide>
        OK
      </ion-slide>
    </ion-slides>
  </ion-page>
</template>

<script lang="ts">
import { 
  isPlatform,
  modalController,
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonPage,
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
  IonToggle
} from '@ionic/vue';
import {
  saveOutline,
  saveSharp
} from 'ionicons/icons';
import { TransmissionRPC } from "../services/TransmissionRPC";
import { defineComponent } from 'vue';
import { Locale } from "../services/Locale";

export default defineComponent({
  name: 'Server configuration',
  components: { 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButtons,
    IonPage,
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
    IonToggle
  },
  data() {
    return {
      config: TransmissionRPC.sessionArguments,
      selectedTab:0
    }
  },
  setup() {
    if (!window.history.state.modal) {
      const modalState = { modal: true };
      history.pushState(modalState, "");
    }

    return { 
      Locale,
      saveOutline,
      saveSharp
    }
  },
  created() {
    console.log(this.config);
  },
  computed: {
    appVersion: function(): string {
      return `v${process.env.PACKAGE_VERSION||"1.0.0"}`;
    },
    isWebUI: function() {
      return !isPlatform("electron") && !isPlatform("capacitor")
    },
    slidesOptions: function(): Record<string,any> {
      return {
        centeredSlides:true,
        initialSlide:this.selectedTab,
        resistanceRatio:isPlatform("ios") ? 0.85 : 0,
        simulateTouch:false
      }
    },
  },
  methods: {
    modalClose () {
      modalController.dismiss();
    },
    formatText(text: string) {
      const clean = Locale.formatString(text,"","") as string;
      const linkStart = text.indexOf("{0}");
      return {
        before:clean.substring(0,linkStart),
        after:clean.substring(linkStart)
      }
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
      const segment = this.$refs[`segment-${activeIndex}`] as Record<string,any>;
      this.selectedTab=activeIndex;
      this.setTab(activeIndex, false);
      segment.$el.click();
    },
    
  },
});
</script>

<style scoped>
ion-content {
  text-align: left;
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