<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="#" @click="modalClose()"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ Locale.settings }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="saveSettings()" fill="clear">
            <ion-icon slot="icon-only" :ios="saveOutline" :md="saveSharp"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding" ref="content">
      <ion-list>
        <ion-list-header>
          <ion-label>
              {{ Locale.interface }}
          </ion-label>
        </ion-list-header>

        <ion-item>
          <ion-label>{{ Locale.language }}</ion-label>
          <ion-select placeholder="Select One" v-model="sharedState.language" :okText="Locale.ok" :cancelText="Locale.actions.cancel">
            <ion-select-option value="default">{{ Locale.default }}</ion-select-option>
            <ion-select-option value="en">English</ion-select-option>
            <ion-select-option value="es">Español</ion-select-option>
            <ion-select-option value="fr">Français</ion-select-option>
            <ion-select-option value="it">Italiano</ion-select-option>
            <ion-select-option value="nl">Nederlands</ion-select-option>
            <ion-select-option value="ru">Pусский</ion-select-option>
            <ion-select-option value="zh-tw">繁體中文</ion-select-option>
          </ion-select>
        </ion-item>
          
        <ion-item>
          <ion-label>{{ Locale.theme }}</ion-label>
          <ion-select placeholder="Select One" v-model="sharedState.colorScheme" :okText="Locale.ok" :cancelText="Locale.actions.cancel">
            <ion-select-option value="default">{{ Locale.default }}</ion-select-option>
            <ion-select-option value="light">{{ Locale.light }}</ion-select-option>
            <ion-select-option value="dark">{{ Locale.dark }}</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label>{{ Locale.speedUnit }}</ion-label>
          <ion-toggle v-model="sharedState.useBits"></ion-toggle>
        </ion-item>

        <ion-item>
          <ion-label>{{ Locale.expandSideMenu }}</ion-label>
          <ion-toggle v-model="sharedState.expandMenu"></ion-toggle>
        </ion-item>
        
        <ion-item>
          <ion-label>{{ Locale.displayFlag }}*</ion-label>
          <ion-toggle v-model="sharedState.ipFlags"></ion-toggle>
        </ion-item>
        <div class="annotation">
          * {{ Locale.useIpApi }} <a href="https://ip-api.com/docs/legal" target="_blank" rel="noopener"><ion-icon slot="icon-only" :ios="informationCircleOutline" :md="informationCircleSharp"></ion-icon></a>
        </div>
      </ion-list>

      <ion-list>
        <ion-list-header>
          <ion-label>
              {{ Locale.connection }}
          </ion-label>
        </ion-list-header>

        <ion-item>
          <ion-label position="floating">{{ Locale.refreshInterval }}</ion-label>
          <ion-input type="number" v-model="sharedState.refreshInterval" ></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">{{ Locale.connectionTimeout }}</ion-label>
          <ion-input type="number" v-model="sharedState.timeout" ></ion-input>
        </ion-item>
      </ion-list>

      <ion-list v-if="bookmarkletEnabled">
        <ion-list-header>
          <ion-label>
            {{ Locale.bookmarklet }}
          </ion-label>
        </ion-list-header>

        <ion-item>
          {{ Locale.bookmarkletDetail }}
        </ion-item>

        <div class="ion-padding small">
          <a :href="bookmarkletScript"><ion-button size="default">Download with Transmissionic</ion-button></a>
        </div>
      </ion-list>

      <ion-list>
        <ion-list-header>
          <ion-label>
            {{ Locale.reset }}
          </ion-label>
        </ion-list-header>

        <div class="ion-padding small">
          <ion-button size="default" @click="resetSettings()">{{ Locale.resetSettings }}</ion-button>
        </div>
      </ion-list>
    </ion-content>
    
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { 
  modalController,
  alertController,
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonList,
  IonItem, 
  IonLabel,
  IonListHeader,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonButtons,
  IonButton,
  IonPage,
  IonInput,
  IonBackButton,
  IonToggle,
  isPlatform
} from '@ionic/vue';
import {
  saveOutline,
  saveSharp,
  informationCircleOutline,
  informationCircleSharp
} from 'ionicons/icons';
import { Utils } from "../services/Utils";
import { Locale } from "../services/Locale";
import { UserSettings } from "../services/UserSettings";
import { Emitter } from '../services/Emitter';

declare global {
  interface Window {
    magnetProtocol: any;
  }
}

const bookmarkletFunction = (href: string) => {
  let found=0;
  let selection=(getSelection()||"").toString();
  const hashRegex = /^[0-9a-fA-F]{40}$/;
  const magnetRegex = /^magnet:\?xt=urn:btih:[0-9a-zA-Z]{32,}(&.+)?$/;
  if(selection.match(hashRegex)||selection.match(magnetRegex)){
    found=4;
  }
  else {
    document.querySelectorAll('a').forEach((link)=> {
      if(found<1 && link.href.match(/\/(torrent|download|get|dl)\W/)){
        selection="url:"+link.href;
        found=1;
      }
      else if(found<2 && link.href.match(/\.torrent$/)){
        selection="url:"+link.href;
        found=2;
      }
      else if(found<3 && link.href.match(magnetRegex)){
        selection=link.href;
        found=3;
      }
    });
  }
  found ? window.open(href+"#"+selection) : alert("No torrent or magnet link found.");
}

export default defineComponent({
  name: 'Settings',
  data() {
    return {
      sharedState: UserSettings.state,
      privateState: {}
    }
  },
  components: { 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonList,
    IonItem, 
    IonLabel,
    IonListHeader,
    IonSelect,
    IonSelectOption,
    IonIcon,
    IonButtons,
    IonButton,
    IonPage,
    IonInput,
    IonBackButton,
    IonToggle
  },
  computed: {
    bookmarkletEnabled(): boolean {
      return !isPlatform("electron") && !isPlatform("capacitor")
    }
  },
  setup() {
    Utils.pushState();

    const bookmarkletScript = `javascript:(${bookmarkletFunction})("${window.location.href}");`;

    return { 
      Locale,
      bookmarkletScript,
      saveOutline,
      saveSharp,
      informationCircleOutline,
      informationCircleSharp
    }
  },
  mounted() {
    Utils.customScrollbar(this.$refs.content);
    Emitter.on('language-changed', () => { this.$forceUpdate() });
  },
  methods: {
    saveSettings () {
      UserSettings.saveSettings();
      this.savedToast();
    },
    modalClose () {
      modalController.dismiss();
    },
    async savedToast() {
      Utils.responseToast("success")
    },
    async resetSettings(){
      const alert = await alertController
        .create({
          header: Locale.prompt.confirmation,
          message: Locale.prompt.reset,
          buttons: [
            {
              text: Locale.actions.cancel,
              role: 'cancel'
            },
            {
              text: Locale.prompt.confirm,
              handler: () => {
                UserSettings.resetSettings();
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
.content {
  padding-top:var(--offset-top);
}

.annotation {
  padding: 10px 16px 0px 16px;
  color:var(--ion-color-medium);
}
.annotation a {
  color:inherit;
}
.annotation ion-icon {
  vertical-align: middle;
}
</style>
