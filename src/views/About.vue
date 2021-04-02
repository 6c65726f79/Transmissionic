<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="#" @click="modalClose()"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ Locale.about.about }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="app-details">
        <img :src="iconSrc" alt="Logo">
        <ion-title>Transmissionic {{appVersion}}</ion-title>
      </div>
      <p>
        {{Locale.about.description}}
      </p>
      <p>
        {{formatText(Locale.about.github).before}}
        <a href="https://github.com/6c65726f79/Transmissionic" target="_blank" rel="noopener">https://github.com/6c65726f79/Transmissionic</a>
        {{formatText(Locale.about.github).after}}
      </p>
      <p>
        {{formatText(Locale.about.poeditor).before}}
        <a href="https://poeditor.com/join/project?hash=sbVnI9eo3d" target="_blank" rel="noopener">https://poeditor.com/join/project?hash=sbVnI9eo3d</a>
        {{formatText(Locale.about.poeditor).after}}
      </p>
      
      <p v-if="isWebUI">
        <ion-button size="default" @click="checkForUpdates()">{{ Locale.checkUpdates }}</ion-button>
      </p>

      <p v-if="updateAvailable && downloadUrl">
        <strong>{{ Locale.updateAvailable }}</strong> <a :href="downloadUrl" target="_blank" rel="noopener">{{newVersion}}</a>
      </p>
    </ion-content>
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
  IonButton,
  IonButtons,
  IonPage,
  IonBackButton
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { Locale } from "../services/Locale";
import { Utils } from "../services/Utils";

declare global {
  interface Window {
      updates: any;
  }
}

export default defineComponent({
  name: 'About',
  components: { 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButton,
    IonButtons,
    IonPage,
    IonBackButton
  },
  data() {
    return {
      updateAvailable:false,
      newVersion:"",
      downloadUrl:""
    }
  },
  setup() {
    if (!window.history.state.modal) {
      const modalState = { modal: true };
      history.pushState(modalState, "");
    }

    return { 
      Locale,
      iconSrc:"./assets/icon/favicon.png" // Force Vue.js to load relative path without transformAssetUrls
    }
  },
  computed: {
    appVersion: function(): string {
      return `v${process.env.PACKAGE_VERSION||"1.0.0"}`;
    },
    isWebUI: function() {
      return !isPlatform("electron") && !isPlatform("capacitor")
    }
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
    checkForUpdates() {
      fetch('https://api.github.com/repos/6c65726f79/Transmissionic/releases/latest')
        .then(async (response) => {
          Utils.responseToast("success");
          const result = await response.json()
          if(!result.prerelease){
            this.updateAvailable = this.isNewerVersion(this.appVersion,result.name)
            this.newVersion = result.name;
            this.downloadUrl = `https://github.com/6c65726f79/Transmissionic/releases/tag/${result.name}`;
          }
        })
      
    },
    isNewerVersion(current: string, latest: string) {
      if(current==latest) return false;
      const currentNums = current.substring(1).split('.');
      const latestNums = latest.substring(1).split('.');
      for (let i = 0; i < latestNums.length; i++) {
        const latestNum = parseInt(latestNums[i]);
        const currentNum = parseInt(currentNums[i]);
        if(!isNaN(latestNum) && !isNaN(currentNum)){
          if(latestNum>currentNum){
            return true;
          }
          else if(latestNum<currentNum){
            return false;
          }
        }
        else if(isNaN(currentNum)){
          return false;
        }
      }
      return false;
    }
  },
});
</script>

<style scoped>
.app-details {
  text-align: center;
  margin:40px 0px;
}
.app-details img {
  height:60px;
  margin-bottom:10px;
}
</style>