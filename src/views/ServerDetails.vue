<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="#" @click="modalClose()"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ add ? Locale.newServer : Locale.serverDetails }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="deleteSettings()" fill="clear" v-if="!add" :aria-label="Locale.actions.delete">
            <ion-icon slot="icon-only" :ios="trashOutline" :md="trashSharp"></ion-icon>
          </ion-button>
          <ion-button @click="saveSettings()" fill="clear" aria-label="Save">
            <ion-icon slot="icon-only" v-if="!add" :ios="saveOutline" :md="saveSharp"></ion-icon>
            <ion-icon slot="icon-only" v-if="add" :ios="checkmarkOutline" :md="checkmarkSharp"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" ref="content" class="ion-padding">
      
      <ion-list>
        <ion-list-header>
          <ion-label>
            {{ Locale.general }}
          </ion-label>
        </ion-list-header>

        <ion-item>
          <ion-label position="floating">{{ Locale.name }}</ion-label>
          <ion-input v-model="newConf.name"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">{{ Locale.hostname }}</ion-label>
          <ion-input v-model="newConf.host"></ion-input>
        </ion-item>
        
        <ion-item>
          <ion-label position="floating">{{ Locale.port }}</ion-label>
          <ion-input v-model="newConf.port" type="number" placeholder="9091"></ion-input>
        </ion-item>
        
        <ion-item>
          <ion-label position="floating">{{ Locale.rpcPath }}</ion-label>
          <ion-input v-model="newConf.path" placeholder="/transmission/rpc"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label>HTTPS</ion-label>
          <ion-toggle v-model="newConf.https"></ion-toggle>
        </ion-item>
      </ion-list>

      <ion-list>
        <ion-list-header>
          <ion-label>
            {{ Locale.auth }}
          </ion-label>
        </ion-list-header>

        <ion-item>
          <ion-label position="floating">{{ Locale.username }}</ion-label>
          <ion-input :disabled="!authEnabled" v-model="newConf.auth.username"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">{{ Locale.password }}</ion-label>
          <ion-input :disabled="!authEnabled" v-model="newConf.auth.password" type="password"></ion-input>
        </ion-item>
      </ion-list>

      <ion-list v-if="pathMappingEnabled">
        <ion-list-header>
          <ion-label>
            {{ Locale.pathMapping }}
          </ion-label>
        </ion-list-header>

        <ion-item>
          <ion-textarea rows="3" :placeholder="placeholder" v-model="newConf.pathMapping"></ion-textarea>
        </ion-item>
        
      </ion-list>
      
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { 
  isPlatform,
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
  IonIcon,
  IonButtons,
  IonButton,
  IonToggle,
  IonInput,
  IonPage,
  IonBackButton,
  IonTextarea
} from '@ionic/vue';
import {
  trashOutline,
  trashSharp,
  saveOutline,
  saveSharp,
  checkmarkOutline,
  checkmarkSharp
} from 'ionicons/icons';
import * as _ from 'lodash';
import { Locale } from "../services/Locale";
import { Utils } from "../services/Utils";
import { UserSettings } from '../services/UserSettings';

export default defineComponent({
  name: 'ServerDetails',
  props: {
    serverList: { 
      type: Object,
      default: function () {
        return {}
      }
    },
    serverId: {
      type: Number,
      default: function () {
        return 0
      }
    },
    add: {
      type:Boolean
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
    IonIcon,
    IonButtons,
    IonButton,
    IonToggle,
    IonInput,
    IonPage,
    IonBackButton,
    IonTextarea
  },
  setup() {
    Utils.pushState();

    const placeholder = `${Locale.example}\r/mnt/ssd = \\\\192.168.1.1\\ssd\r/home/user/Downloads = Z:\\Downloads`;

    return { 
      Locale,
      placeholder,
      trashOutline,
      trashSharp,
      saveOutline,
      saveSharp,
      checkmarkOutline,
      checkmarkSharp
    }
  },
  mounted() {
    // Custom scrollbar for Web Browser and Electron
    Utils.customScrollbar(this.$refs.content);
  },
  computed: {
    newConf: function (): Record<string, any> {
      let conf;
      if(this.serverId<this.serverList.length){
        conf = _.clone(this.serverList[this.serverId])
        conf.auth = _.clone(this.serverList[this.serverId]).auth || {}
      }
      else {
        conf = {auth:{}}
      }
      return conf;
    },
    authEnabled: function () {
      return isPlatform("electron") || isPlatform("capacitor") || process.env.NODE_ENV==="development"
    },
    pathMappingEnabled: function () {
      return isPlatform("electron");
    }
  },
  methods: {
    async saveSettings () {
      if(!this.newConf.name){
        this.newConf.name=this.newConf.host || `Server #${this.serverList.length+1}`;
      }
      const newSettings = _.clone(this.serverList)
      newSettings[this.serverId] = _.clone(this.newConf);
      if(!newSettings[this.serverId].auth.username || !newSettings[this.serverId].auth.password){
        delete newSettings[this.serverId].auth;
      }
      UserSettings.saveServerList(newSettings)
      Object(this.serverList)[this.serverId]=newSettings[this.serverId];
      this.savedToast();
      if(this.add){
        this.modalClose();
      }
      
    },
    async deleteSettings () {
      const alert = await alertController
        .create({
          header: Locale.prompt.confirmation,
          message: Locale.formatString(Locale.prompt.delete, `"${this.serverList[this.serverId].name}"`) as string,
          buttons: [
            {
              text: Locale.actions.cancel,
              role: 'cancel'
            },
            {
              text: Locale.prompt.confirm,
              handler: () => {
                Object(this.serverList).splice(this.serverId, 1)
                UserSettings.saveServerList(this.serverList)
                this.modalClose();
              },
            },
          ],
        });
      return alert.present();
    },
    modalClose () {
      modalController.dismiss();
    },
    async savedToast() {
      Utils.responseToast("success")
    },
  },
});
</script>