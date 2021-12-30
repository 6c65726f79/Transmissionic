<template>
  <div class="alert-head">
    <h2 class="alert-title">{{Locale.actions.setLocation}}</h2>
  </div>
  <div class="alert-input-group">
    <autocomplete 
      :items="TransmissionRPC.persistentData.downloadDir"
      :value="value"
      v-on:update="setLocation">
    </autocomplete>
  </div>
  <div class="alert-checkbox-group">
    <button @click="switchMove()" type="button" :aria-checked="move" tabindex="0" role="checkbox" class="alert-tappable alert-checkbox alert-checkbox-button ion-focusable sc-ion-alert-md">
      <div class="alert-button-inner">
        <div class="alert-checkbox-icon">
          <div class="alert-checkbox-inner"></div>
        </div>
        <div class="alert-checkbox-label">{{Locale.moveData}}</div>
      </div>
    </button>
  </div>
  <div class="alert-button-group">
    <ion-button fill="clear" @click="cancel()">
      {{Locale.actions.cancel}}
    </ion-button>
    <ion-button fill="clear" @click="confirm()">
      {{Locale.ok}}
    </ion-button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { 
  modalController,
  IonButton,
} from '@ionic/vue';
import Autocomplete from './Autocomplete.vue';
import { TransmissionRPC } from "../../services/TransmissionRPC";
import { Locale } from "../../services/Locale";

export default defineComponent({
  name: 'About',
  props:["value"],
  components: { 
    Autocomplete,
    IonButton,
  },
  data() {
    return {
      location:"",
      move:false
    }
  },
  setup() {
    return { 
      Locale,
      TransmissionRPC
    }
  },
  mounted() {
    this.location=this.value;
  },
  methods: {
    cancel() {
      modalController.dismiss();
    },
    confirm() {
      modalController.dismiss({location:this.location,move:this.move});
    },
    switchMove() {
      this.move=!this.move;
    },
    setLocation(location: string) {
      this.location=location;
    },
  },
});
</script>

<style>
.md .location-alert {
  --background: var(--ion-overlay-background-color, var(--ion-background-color, #fff));
  --backdrop-opacity: var(--ion-backdrop-opacity, 0.32) !important;
  --width: 350px;
  --min-height:250px;
  --height: auto;
  --max-height: 90%;
  --max-width: 90%;
  font-size: 14px;
  font-family: var(--ion-font-family, inherit);
}

.md .location-alert::part(content) {
  overflow: visible;
  border-radius: 4px;
  -webkit-box-shadow: 0 11px 15px -7px rgba(0, 0, 0, 0.2), 0 24px 38px 3px rgba(0, 0, 0, 0.14), 0 9px 46px 8px rgba(0, 0, 0, 0.12);
  box-shadow: 0 11px 15px -7px rgba(0, 0, 0, 0.2), 0 24px 38px 3px rgba(0, 0, 0, 0.14), 0 9px 46px 8px rgba(0, 0, 0, 0.12);
}

.md .location-alert .ion-page {
  overflow: visible;
}

.md .location-alert .alert-head {
  padding-left: unset;
  padding-right: unset;
  -webkit-padding-start: 23px;
  padding-inline-start: 23px;
  -webkit-padding-end: 23px;
  padding-inline-end: 23px;
}

.md .location-alert .alert-title {
  color: var(--ion-text-color, #000);
  font-size: 20px;
  font-weight: 500;
}

.md .location-alert .alert-input-group {
  padding-left: unset;
  padding-right: unset;
  -webkit-padding-start: 24px;
  padding-inline-start: 24px;
  -webkit-padding-end: 24px;
  padding-inline-end: 24px;
  padding-top: 20px;
  padding-bottom: 20px;
  color: var(--ion-color-step-550, #737373);
}

.md .location-alert .alert-input-group input {
  border-bottom: 1px solid var(--ion-color-step-150, #d9d9d9);
  color: var(--ion-text-color, #000);
  margin-left: 0;
  margin-right: 0;
  margin-top: 5px;
  margin-bottom: 5px;
}

.md .location-alert .alert-input-group input:focus {
  margin-bottom: 4px;
  border-bottom: 2px solid var(--ion-color-primary, #3880ff);
}

.md .location-alert .alert-checkbox-group {
  position: relative;
  max-height: 240px;
  border-top: 1px solid var(--ion-color-step-150, #d9d9d9);
  border-bottom: 1px solid var(--ion-color-step-150, #d9d9d9);
  overflow: hidden;
}

.md .location-alert .alert-checkbox-group .alert-checkbox  {
  position: relative;
  height: 48px;
  overflow: hidden;
  width: 100%;
  border: 0;
  background: transparent;
  font-size: inherit;
  line-height: initial;
  text-align: start;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  contain: strict;
  outline: none;
}

.md .location-alert .alert-checkbox-group .alert-button-inner {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-flow: row nowrap;
  flex-flow: row nowrap;
  -ms-flex-negative: 0;
  flex-shrink: 0;
  -ms-flex-align: center;
  align-items: center;
  -ms-flex-pack: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.md .location-alert .alert-checkbox-group .alert-checkbox-label {
  padding-left: unset;
  padding-right: unset;
  -webkit-padding-start: 53px;
  padding-inline-start: 53px;
  -webkit-padding-end: 26px;
  padding-inline-end: 26px;
  padding-top: 13px;
  padding-bottom: 13px;
  flex: 1;
  color: var(--ion-color-step-850, #262626);
  font-size: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.md .location-alert .alert-checkbox-group .alert-checkbox-icon {
  left: 26px;
  top: 0;
  border-radius: 2px;
  position: relative;
  width: 16px;
  height: 16px;
  border-width: 2px;
  border-style: solid;
  border-color: var(--ion-color-step-550, #737373);
  contain: strict;
}

.md .location-alert .alert-checkbox-group .alert-checkbox[aria-checked=true] .alert-checkbox-icon {
  border-color: var(--ion-color-primary, #3880ff);
  background-color: var(--ion-color-primary, #3880ff);
}

.md .location-alert .alert-checkbox-group .alert-checkbox[aria-checked=true] .alert-checkbox-inner {
  left: 3px;
  top: 0;
  position: absolute;
  width: 6px;
  height: 10px;
  -webkit-transform: rotate(45deg);
  transform: rotate(45deg);
  border-width: 2px;
  border-top-width: 0;
  border-left-width: 0;
  border-style: solid;
  border-color: var(--ion-color-primary-contrast, #fff)
}

.md .location-alert .alert-button-group {
  width: 100%;
  padding-left: unset;
  padding-right: unset;
  -webkit-padding-start: 8px;
  padding-inline-start: 8px;
  -webkit-padding-end: 8px;
  padding-inline-end: 8px;
  padding-top: 8px;
  padding-bottom: 8px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}

.md .location-alert .alert-button-group ion-button {
  --background-hover-opacity: 0;
}

.ios .location-alert {
  --background: var(--ion-overlay-background-color, var(--ion-background-color, #fff));
  --backdrop-opacity: var(--ion-backdrop-opacity, 0.3) !important;
  --width: 350px;
  --min-height:206px;
  --height: auto;
  --max-height: 90%;
  --max-width: 90%;
  font-size: 14px;
  font-family: var(--ion-font-family, inherit);
}

.ios .location-alert::part(content) {
  overflow: visible;
  border-radius: 13px;
}

.ios .location-alert .ion-page {
  overflow: visible;
}

.ios .location-alert .alert-head {
  padding-left: unset;
  padding-right: unset;
  -webkit-padding-start: 16px;
  padding-inline-start: 16px;
  -webkit-padding-end: 16px;
  padding-inline-end: 16px;
  padding-top: 12px;
  padding-bottom: 7px;
  text-align: center;
}

.ios .location-alert .alert-title {
  margin-top: 8px;
  color: var(--ion-text-color, #000);
  font-size: 17px;
  font-weight: 600;
}

.ios .location-alert .alert-input-group {
  padding-left: unset;
  padding-right: unset;
  -webkit-padding-start: 16px;
  padding-inline-start: 16px;
  -webkit-padding-end: 16px;
  padding-inline-end: 16px;
  padding-top: 0px;
  padding-bottom: 21px;
  color: var(--ion-text-color, #000);
  font-size: 13px;
  /*text-align: center;*/
}

.ios .location-alert .alert-input-group input {
  border-radius: 4px;
  margin-top: 10px;
  padding-left: 6px;
  padding-right: 6px;
  padding-top: 6px;
  padding-bottom: 6px;
  border: 0.55px solid var(--ion-color-step-250, #bfbfbf);
  background-color: var(--ion-background-color, #fff);
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.ios .location-alert .alert-checkbox-group {
  overscroll-behavior: contain;
  max-height: 240px;
  border-top: 0.55px solid rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.2);
  overflow-y: hidden;
}

.ios .location-alert .alert-checkbox-group .alert-checkbox  {
  height: 44px;
  margin-left: 0;
  margin-right: 0;
  margin-top: 0;
  margin-bottom: 0;
  padding-left: 0;
  padding-right: 0;
  padding-top: 0;
  padding-bottom: 0;
  display: -ms-flexbox;
  display: flex;
  width: 100%;
  border: 0;
  background: transparent;
  font-size: inherit;
  line-height: initial;
  text-align: start;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  contain: strict;
  outline: none;
}

.ios .location-alert .alert-checkbox-group .alert-button-inner {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-flow: row nowrap;
  flex-flow: row nowrap;
  -ms-flex-negative: 0;
  flex-shrink: 0;
  -ms-flex-align: center;
  align-items: center;
  -ms-flex-pack: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.ios .location-alert .alert-checkbox-group .alert-checkbox-label {
  -webkit-padding-start: 13px;
  padding-inline-start: 13px;
  -webkit-padding-end: 13px;
  padding-inline-end: 13px;
  padding-left: 13px;
  padding-right: 13px;
  padding-top: 13px;
  padding-bottom: 13px;
  -ms-flex: 1;
  flex: 1;
  color: var(--ion-text-color, #000);
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.ios .location-alert .alert-checkbox-group .alert-checkbox-icon {
  border-radius: 50%;
  margin-left: 16px;
  margin-right: 6px;
  margin-top: 10px;
  margin-bottom: 10px;
  position: relative;
  width: 24px;
  height: 24px;
  border-width: 1px;
  border-style: solid;
  border-color: var(--ion-item-border-color, var(--ion-border-color, var(--ion-color-step-250, #c8c7cc)));
  background-color: var(--ion-item-background, var(--ion-background-color, #fff));
  contain: strict;
}

.ios .location-alert .alert-checkbox-group .alert-checkbox[aria-checked=true] .alert-checkbox-icon {
  border-color: var(--ion-color-primary, #3880ff);
  background-color: var(--ion-color-primary, #3880ff);
}

.ios .location-alert .alert-checkbox-group .alert-checkbox[aria-checked=true] .alert-checkbox-inner {
  left: 9px;
  top: 4px;
  position: absolute;
  width: 5px;
  height: 12px;
  -webkit-transform: rotate(45deg);
  transform: rotate(45deg);
  border-width: 1px;
  border-top-width: 0;
  border-left-width: 0;
  border-style: solid;
  border-color: var(--ion-background-color, #fff);
}

.ios .location-alert .alert-button-group {
  -webkit-margin-end: -0.55px;
  margin-inline-end: -0.55px;
  margin-right: -0.55px;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-direction: row;
  flex-direction: row;
  width: 100%;
}

.ios .location-alert .alert-button-group ion-button:last-child {
  border-right: 0;
  font-weight: bold;
}

.ios .location-alert .alert-button-group ion-button {
  margin-left: 0;
  margin-right: 0;
  margin-top: 0;
  margin-bottom: 0;
  border-radius: 0;
  -ms-flex: 1 1 auto;
  flex: 1 1 auto;
  min-width: 50%;
  height: 44px;
  border-top: 0.55px solid rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.2);
  border-right: 0.55px solid rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.2);
  background-color: transparent;
  color: var(--ion-color-primary, #3880ff);
  font-size: 17px;
  overflow: hidden;
  --background-focused-opacity: 0;
}

.ios .location-alert .alert-button-group ion-button.ion-activated {
  background-color: rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.1);
  opacity: 1;
}

.ios .location-alert .alert-button-group ion-button:hover {
  opacity: 1;
} 
</style>