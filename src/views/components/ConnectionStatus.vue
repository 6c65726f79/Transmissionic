<template>
  <ion-content>
    <div class="placeholder" >
      <template v-if="connectionStatus.error!=''">
        <strong>{{ Locale.error.error }}</strong>
        <p>{{ Utils.localizeError(connectionStatus.error) }}</p>
        <a @click="$emit('retry')">{{ Locale.retry }}</a>
      </template>
      <template v-else-if="connectionStatus.loading">
        <ion-spinner></ion-spinner>
      </template>
      <template v-else-if="serverCount.value==0">
        <strong>{{ Locale.empty }}</strong>
        <p>{{addServerText().before}}<a @click='addServer()'>{{addServerText().link}}</a>{{addServerText().after}}</p>
      </template>
    </div>
  </ion-content>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { 
  IonContent,
  IonSpinner
} from '@ionic/vue';
import { Locale } from "../../services/Locale";
import { Emitter } from "../../services/Emitter";
import { Utils } from '../../services/Utils';

export default defineComponent({
  name: 'ConnectionStatus',
  inject: ["connectionStatus","serverCount"],
  components: { 
    IonContent,
    IonSpinner
  },
  setup() {
    return { 
      Locale,
      Utils
    }
  },
  mounted() {
    Emitter.on('language-changed', () => { this.$forceUpdate() });
  },
  methods: {
    addServer() {
      Emitter.emit('add-server')
    },
    addServerText() {
      const text = Locale.formatString(Locale.startByAddingServer,"","") as string;
      const linkStart = Locale.startByAddingServer.indexOf("{0}");
      let linkEnd = Locale.startByAddingServer.replace("{0}","").indexOf("{1}");
      if(linkEnd<0){
        linkEnd=Locale.startByAddingServer.length;
      }
      return {
        before:text.substring(0,linkStart),
        link:text.substring(linkStart,linkEnd),
        after:text.substring(linkEnd)
      }
    }
  }
});
</script>