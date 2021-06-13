<template>
  <ion-page>
    <ion-header :translucent="true">
        <ion-toolbar>
            <ion-buttons slot="start">
            <ion-back-button defaultHref="#" @click="modalClose()"></ion-back-button>
            </ion-buttons>
            <ion-title>Preset</ion-title>
            <ion-buttons slot="end">
            <ion-button @click="add()" fill="clear">
                <ion-icon slot="icon-only" :ios="checkmarkOutline" :md="checkmarkSharp"></ion-icon>
            </ion-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      
        <ion-list>
            <ion-list-header>
              <ion-label>
                {{ Locale.options }}
              </ion-label>
            </ion-list-header>

            <ion-item>
                <ion-label position="floating">{{ Locale.name }}</ion-label>
                <ion-input v-model="name"></ion-input>
            </ion-item>

            <ion-item class="autocomplete" v-if="connectionStatus.connected">
              <ion-label position="floating">{{ Locale.downloadDir }}</ion-label>
              <autocomplete 
                :items="TransmissionRPC.persistentData.downloadDir"
                :placeholder="defaultDownloadDir"
                v-on:update="setDownloadDir">
              </autocomplete>
            </ion-item>

            <ion-item>
              <ion-label>{{ Locale.actions.start }}</ion-label>
              <ion-toggle v-model="settings.start" class="swiper-no-swiping"></ion-toggle>
            </ion-item>

            <p>
                <ion-list-header>
                    {{ Locale.bandwidth }}
                </ion-list-header>

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

                <ion-item>
                    <div class="left">
                        <ion-label position="floating">
                            {{ Locale.downloadLimit }} ({{ speedUnit }})
                        </ion-label>
                        <ion-input v-model.number="settings.other.downloadLimit" type="number" :disabled="!settings.other.downloadLimited"></ion-input>
                    </div>
                    <ion-toggle v-model="settings.other.downloadLimited" slot="end" class="swiper-no-swiping"></ion-toggle>
                </ion-item>

                <ion-item>
                    <div class="left">
                        <ion-label position="floating">
                            {{ Locale.uploadLimit }} ({{ speedUnit }})
                        </ion-label>
                        <ion-input v-model.number="settings.other.uploadLimit" type="number" :disabled="!settings.other.uploadLimited"></ion-input>
                    </div>
                    <ion-toggle v-model="settings.other.uploadLimited" slot="end" class="swiper-no-swiping"></ion-toggle>
                </ion-item>
            </p>
        </ion-list>

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
  IonButton,
  IonButtons,
  IonPage,
  IonBackButton,
  IonIcon,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonInput
} from '@ionic/vue';
import {
  checkmarkOutline,
  checkmarkSharp
} from 'ionicons/icons';
import { defineComponent } from 'vue';
import Autocomplete from './components/Autocomplete.vue';
import { TransmissionRPC } from "../services/TransmissionRPC";
import { UserSettings } from '../services/UserSettings';
import { Locale } from "../services/Locale";
import { Utils } from "../services/Utils";

declare global {
  interface Window {
      updates: any;
  }
}

export default defineComponent({
    name: 'Preset',
    inject: ["connectionStatus"],
    components: { 
        Autocomplete,
        IonContent, 
        IonHeader, 
        IonTitle, 
        IonToolbar,
        IonButton,
        IonButtons,
        IonPage,
        IonBackButton,
        IonIcon,
        IonList,
        IonListHeader,
        IonItem,
        IonLabel,
        IonToggle,
        IonSelect,
        IonSelectOption,
        IonInput
    },
    data() {
        return {
            defaultDownloadDir:"",
            name:"",
            settings:{
                start:true,
                downloadDir:"",
                bandwidthPriority:0,
                other:{
                    downloadLimited:false,
                    uploadLimited:false,
                    downloadLimit:0,
                    uploadLimit:0,
                }
                
            }
        }
    },
    setup() {
        Utils.pushState();

        return { 
            Locale,
            TransmissionRPC,
            checkmarkOutline,
            checkmarkSharp
        }
    },
    async created() {
        this.defaultDownloadDir = await TransmissionRPC.getSessionArgument('download-dir')
    },
    computed: {
        speedUnit:() => {
            return 'K' + (UserSettings.state.useBits ? Locale.units.bit : Locale.units.byte) + Locale.units.perSecond
        }
    },
    methods: {
        modalClose () {
            modalController.dismiss();
        },
        setDownloadDir(directory: string) {
            this.settings.downloadDir=directory;
        },
        async add() {
            if(this.name!=""){
                if(UserSettings.state.useBits){
                    // Bits to bytes
                    this.settings.other.downloadLimit = Math.round(this.settings.other.downloadLimit/8);
                    this.settings.other.uploadLimit = Math.round(this.settings.other.uploadLimit/8);
                }

                const presets = await UserSettings.loadPresets();
                presets[this.name]=this.settings;
                UserSettings.savePresets(presets);
                Utils.responseToast("success");
                this.modalClose();
            }
        }
    },
});
</script>

<style scoped>
p {
  margin-top: 16px;
  margin-bottom: 0px;
}

.autocomplete {
    overflow: visible;
    z-index: 100;
}

.left {
    position: absolute;
    bottom: 0px;
}
</style>