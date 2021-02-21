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
          <ion-select placeholder="Select One" :value="sharedState.language" v-on:ionChange="updateSetting($event,'language')" :cancelText="Locale.actions.cancel">
            <ion-select-option value="default">{{ Locale.default }}</ion-select-option>
            <ion-select-option value="en">English</ion-select-option>
            <ion-select-option value="fr">Français</ion-select-option>
          </ion-select>
        </ion-item>
          
        <ion-item>
          <ion-label>{{ Locale.theme }}</ion-label>
          <ion-select placeholder="Select One" :value="sharedState.colorScheme" v-on:ionChange="updateSetting($event,'colorScheme')" :cancelText="Locale.actions.cancel">
            <ion-select-option value="default">{{ Locale.default }}</ion-select-option>
            <ion-select-option value="light">{{ Locale.light }}</ion-select-option>
            <ion-select-option value="dark">{{ Locale.dark }}</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label>{{ Locale.speedUnit }}</ion-label>
          <ion-toggle :checked="sharedState.useBits" v-on:ionChange="updateSetting($event,'useBits')"></ion-toggle>
        </ion-item>

        <ion-item>
          <ion-label>{{ Locale.expandSideMenu }}</ion-label>
          <ion-toggle :checked="sharedState.expandMenu" v-on:ionChange="updateSetting($event,'expandMenu')"></ion-toggle>
        </ion-item>
        
        <ion-item>
          <ion-label>{{ Locale.displayFlag }}</ion-label>
          <ion-toggle :checked="sharedState.ipFlags" v-on:ionChange="updateSetting($event,'ipFlags')"></ion-toggle>
        </ion-item>
      </ion-list>

      <ion-list>
        <ion-list-header>
          <ion-label>
              {{ Locale.connection }}
          </ion-label>
        </ion-list-header>

        <ion-item>
          <ion-label position="floating">{{ Locale.refreshInterval }}</ion-label>
          <ion-input type="number" :value="sharedState.refreshInterval" v-on:ionChange="updateSetting($event,'refreshInterval')"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">{{ Locale.connectionTimeout }}</ion-label>
          <ion-input type="number" :value="sharedState.timeout" v-on:ionChange="updateSetting($event,'timeout')"></ion-input>
        </ion-item>
      </ion-list>
    </ion-content>
    
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { 
  modalController,
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
  saveSharp
} from 'ionicons/icons';
import { Utils } from "../services/Utils";
import { Locale } from "../services/Locale";
import { UserSettings } from "../services/UserSettings";

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

    return { 
      Locale,
      saveOutline,
      saveSharp
    }
  },
  mounted() {
    Utils.customScrollbar(this.$refs.content)
  },
  methods: {
    saveSettings () {
      UserSettings.saveSettings();
      this.savedToast();
    },
    modalClose () {
      modalController.dismiss();
    },
    updateSetting (event: any, element: string) {
      if(typeof event.detail.checked!="undefined"){
        UserSettings.setValue(element,event.detail.checked);
      }
      else {
        UserSettings.setValue(element,event.detail.value);
      }
      if(element=="language"){
        this.$forceUpdate();
      }
    },
    async savedToast() {
      Utils.responseToast("success")
    },
  },
});
</script>

<style scoped>
.content {
  padding-top:var(--offset-top);
}
</style>