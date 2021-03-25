<template>
  <ion-content class="ion-padding" ref="content">
    <ion-list>
      <ion-list-header>
        {{ Locale.bandwidth }}
      </ion-list-header>
      <ion-item>
        <div class="left">
          <ion-label position="floating">
           {{ Locale.downloadLimit }} ({{ speedUnit }})
          </ion-label>
          <ion-input v-model.number="details.downloadLimit" type="number" :disabled="!details.downloadLimited"></ion-input>
        </div>
        <ion-toggle v-model="details.downloadLimited" slot="end" class="swiper-no-swiping"></ion-toggle>
      </ion-item>
      <ion-item>
        <div class="left">
          <ion-label position="floating">
            {{ Locale.uploadLimit }} ({{ speedUnit }})
          </ion-label>
          <ion-input v-model.number="details.uploadLimit" type="number" :disabled="!details.uploadLimited"></ion-input>
        </div>
        <ion-toggle v-model="details.uploadLimited" slot="end" class="swiper-no-swiping"></ion-toggle>
      </ion-item>
      <ion-item>
        <ion-label position="floating">
          {{ Locale.peersLimit }}
        </ion-label>
        <ion-input v-model.number="details['peer-limit']" type="number"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label>
          {{ Locale.priority.priority }}
        </ion-label>
        <ion-select placeholder="Select One" :value="details.bandwidthPriority" v-on:ionChange="details.bandwidthPriority=$event.target.value" :cancelText="Locale.actions.cancel">
          <ion-select-option :value="1">{{ Locale.priority.high }}</ion-select-option>
          <ion-select-option :value="0">{{ Locale.priority.normal }}</ion-select-option>
          <ion-select-option :value="-1">{{ Locale.priority.low }}</ion-select-option>
        </ion-select>
      </ion-item>
    </ion-list>

    <ion-list>
      <ion-list-header>
        {{ Locale.ratio }}
      </ion-list-header>
      <ion-item>
        <!-- seedRatioMode : 0 = global settings, 1 = yes, 2 = no -->
        <ion-label>
          {{ Locale.useGlobalLimit }}
        </ion-label>
        <TriToggle
          :value="details.seedRatioMode"
          :true="0"
          v-on:change="details.seedRatioMode=$event.checked ? 0 : 2"
          slot="end"
        ></TriToggle>
        
        
      </ion-item>
      <ion-item :disabled="details.seedRatioMode==0">
        <div class="left">
          <ion-label position="floating">
            {{ Locale.seedRatioLimit }}
          </ion-label>
          <ion-input v-model.number="details.seedRatioLimit" type="number" :disabled="details.seedRatioMode==2"></ion-input>
        </div>
        <TriToggle
          :value="details.seedRatioMode"
          :true="1"
          :false="2"
          v-on:change="details.seedRatioMode=$event.checked ? 1 : $event.value"
          slot="end"
        ></TriToggle>
      </ion-item>
    </ion-list>

    <ion-list>
      <ion-list-header>
        {{ Locale.inactivity }}
      </ion-list-header>
      <ion-item>
        <!-- seedIdleMode : 0 = global settings, 1 = yes, 2 = no -->
        <ion-label>
          {{ Locale.useGlobalLimit }}
        </ion-label>
        <TriToggle
          :value="details.seedIdleMode"
          :true="0"
          v-on:change="details.seedIdleMode=$event.checked ? 0 : 2"
          slot="end"
        ></TriToggle>
      </ion-item>
      <ion-item :disabled="details.seedIdleMode==0">
        <div class="left">
          <ion-label position="floating">
            {{ Locale.stopWhenInactive }}
          </ion-label>
          <ion-input v-model.number="details.seedIdleLimit" type="number" :disabled="details.seedIdleMode==2"></ion-input>
        </div>
        <TriToggle
          :value="details.seedIdleMode"
          :true="1"
          :false="2"
          v-on:change="details.seedIdleMode=$event.checked ? 1 : $event.value"
          slot="end"
        ></TriToggle>
        
      </ion-item>

    </ion-list>
  </ion-content>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';
import { 
  IonContent,
  IonList,
  IonItem,
  IonListHeader,
  IonLabel,
  IonInput,
  IonToggle,
  IonSelect,
  IonSelectOption,
} from '@ionic/vue';
import TriToggle from './TriToggle.vue'
import { Locale } from "../../services/Locale";
import { Utils } from "../../services/Utils";
import { UserSettings } from "../../services/UserSettings";

export default defineComponent({
  components: {
    TriToggle,
    IonContent,
    IonList,
    IonItem,
    IonListHeader,
    IonLabel,
    IonInput,
    IonToggle,
    IonSelect,
    IonSelectOption,
  },
  data() {
    return {
      details:{} as Record<string,any>
    }
  },
  setup() {
    return { 
      Utils,
      Locale
    }
  },
  created() {
    this.details = inject('newOptions') as Record<string,any>;
  },
  mounted() {
    Utils.customScrollbar(this.$refs.content)
  },
  computed: {
    speedUnit:() => {
      return 'K' + (UserSettings.state.useBits ? Locale.units.bit : Locale.units.byte) + Locale.units.perSecond
    }
  }
})
</script>

<style scoped>
.label.no-wrap {
  white-space: normal;
}
.label > div {
  -webkit-transform: translateY(10%) scale(0.75);
  transform: translateY(10%) scale(0.75);
  -webkit-transform-origin: left top;
  transform-origin: left top;
}
.label > span {
  -webkit-touch-callout: text;
  -webkit-user-select: text;
  -khtml-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}
.label > span:empty:after {
  content:"Empty";
  color:var(--ion-color-medium);
  white-space: pre;
}

.left {
  position: absolute;
  bottom: 0px;
}

ion-item p {
  color:var(--color-medium);
}

div[slot="start"]{
  max-width: calc(100% - 68px);
  margin-inline-end:0px;
}
</style>