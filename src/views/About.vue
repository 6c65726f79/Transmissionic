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
        <img src="../../public/assets/icon/favicon.png">
        <ion-title>Transmissionic v{{appVersion}}</ion-title>
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
  setup() {
    if (!window.history.state.modal) {
      const modalState = { modal: true };
      history.pushState(modalState, "");
    }

    return { 
      Locale
    }
  },
  computed: {
    appVersion: function() {
      return process.env.PACKAGE_VERSION;
    }
  },
  methods: {
    modalClose () {
      modalController.dismiss();
    },
    formatText: (text: string) => {
      const clean = Locale.formatString(text,"","") as string;
      const linkStart = text.indexOf("{0}");
      return {
        before:clean.substring(0,linkStart),
        after:clean.substring(linkStart)
      }
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