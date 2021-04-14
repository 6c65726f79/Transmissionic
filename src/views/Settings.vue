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
          <ion-select placeholder="Select One" v-model="sharedState.language" :cancelText="Locale.actions.cancel">
            <ion-select-option value="default">{{ Locale.default }}</ion-select-option>
            <ion-select-option value="en">English</ion-select-option>
            <ion-select-option value="es">Español</ion-select-option>
            <ion-select-option value="fr">Français</ion-select-option>
            <ion-select-option value="ru">Pусский</ion-select-option>
          </ion-select>
        </ion-item>
          
        <ion-item>
          <ion-label>{{ Locale.theme }}</ion-label>
          <ion-select placeholder="Select One" v-model="sharedState.colorScheme" :cancelText="Locale.actions.cancel">
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

      <ion-list>
        <ion-list-header>
          <ion-label>
            Bookmarklet
          </ion-label>
        </ion-list-header>

        <ion-item>
          Drag and drop this button inside your bookmarks bar to import magnet links and hashes from other websites in one click.
        </ion-item>

        <ion-item>
          
          <a :href="bookmarkletScript"><ion-button size="default" >Download with Transmissionic</ion-button></a>
        </ion-item>
      </ion-list>

      <ion-list>
        <ion-list-header>
          <ion-label>
            {{ Locale.reset }}
          </ion-label>
        </ion-list-header>

        <ion-item>
          <ion-button size="default" @click="resetSettings()">{{ Locale.resetSettings }}</ion-button>
        </ion-item>
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
  IonToggle
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
  setup() {
    if (!window.history.state.modal) {
      const modalState = { modal: true };
      history.pushState(modalState, "");
    }

    const bookmarkletFunction = (href: string) => {
      let found=false;
      let selection=getSelection()?.toString()||"";
      const hashRegex = /^[0-9a-fA-F]{40}$/;
      const magnetRegex = /^magnet:\?xt=urn:btih:[0-9a-fA-F]{40}/;
      if(selection.match(hashRegex)||selection.match(magnetRegex)){
        found=true;
      }
      if(!found){
        document.querySelectorAll('a').forEach((link)=> {
          if(link.href.match(magnetRegex) && !found){
            selection=link.href;
            found=true;
          }
        });
      }
      found ? window.open(`${href}#${selection}`) : alert("No magnet links or hashes found.");
    }

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
    },
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