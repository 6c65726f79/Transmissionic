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
        <img :src="iconSrc">
        <ion-title>Transmissionic v{{appVersion}}</ion-title>
        <p v-if="updateAvailable && downloadUrl">
          <b>{{ Locale.updateAvailable }}</b> : {{newVersion}} (<a :href="downloadUrl">{{ Locale.download }}</a>)
        </p>
      </div>
      <p>
        {{Locale.about.description}}
      </p>
      <p>
        {{formatText(Locale.about.github).before}}
        <a href="https://github.com/6c65726f79/Transmissionic" target="_blank">https://github.com/6c65726f79/Transmissionic</a>
        {{formatText(Locale.about.github).after}}
      </p>
      <p>
        {{formatText(Locale.about.poeditor).before}}
        <a href="https://poeditor.com/join/project?hash=sbVnI9eo3d" target="_blank">https://poeditor.com/join/project?hash=sbVnI9eo3d</a>
        {{formatText(Locale.about.poeditor).after}}
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
  IonButtons,
  IonPage,
  IonBackButton
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { Locale } from "../services/Locale";

export default defineComponent({
  name: 'About',
  components: { 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
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
  created() {
    if(this.isWebUI){
      this.checkForUpdate();
    }
  },
  computed: {
    appVersion: function(): string {
      return process.env.PACKAGE_VERSION || "";
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
    checkForUpdate() {
      fetch('https://api.github.com/repos/6c65726f79/Transmissionic/releases/latest')
        .then(async (response) => {
          const result = await response.json()
          this.updateAvailable = this.isNewerVersion(this.appVersion,result.name)
          this.newVersion = result.name;
          for(const asset of result.assets){
            if(asset.name.match(/^Transmissionic-webui-v(\d+\.){3,}zip$/g)){
              this.downloadUrl = asset.browser_download_url;
            }
          }
        })
    },
    isNewerVersion(current: string, latest: string) {
      if(current==latest) return false;
      const currentNums = current.substring(1).split('.');
      const latestNums = latest.substring(1).split('.');
      for (let i = 0; i < latestNums.length; i++) {
        if(Number.isInteger(latestNums[i]) && Number.isInteger(currentNums[i])){
          if( latestNums[i]>currentNums[i]){
            return true;
          }
        }
        else if(Number.isInteger(latestNums[i]) && !Number.isInteger(currentNums[i])){
          return true;
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