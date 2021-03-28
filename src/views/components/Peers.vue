<template>
  <VirtualScroll ref="content" :items="details.peers" :item-size="48" key-field="address">
    <template v-slot:start>
      <ion-list-header id="top">
        <ion-label>
          {{details.peers.length}}
          {{details.peers.length > 1 ? Locale.peer.other : Locale.peer.one }}
        </ion-label>
      </ion-list-header>
    </template>

    <template v-slot:default="{item}">
      <div class="peer">
        <div class="main">
          <div class="bloc fit">
            <img class="flag" v-bind="flagAttributes(item.address)" @click="countryName(item.address)" alt="Country flag">
            {{item.address}}
            <ion-icon v-if="item.isEncrypted" :ios="lockClosedOutline" :md="lockClosedSharp"></ion-icon>
          </div>
          <div class="bloc right truncate">
            <span class="selectable">{{ item.clientName }}</span>
          </div>

        </div>
        <div class="details">
          <span class="bloc">
            <img class="icon" src="../../../public/assets/down.png" alt="Download">
            {{Utils.formatBytes(item.rateToClient,2,true)}}
          </span>

          <span class="bloc">
            <img class="icon" src="../../../public/assets/up.png" alt="Upload">
            {{Utils.formatBytes(item.rateToPeer,2,true)}}
          </span>

          <span style="float:right">
            {{ Utils.getPercent(item.progress) }}
          </span>
        </div>
      </div>
    </template>
  </VirtualScroll>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';
import { 
  IonIcon,
  IonListHeader,
  IonLabel
} from '@ionic/vue';
import {
  lockClosedOutline,
  lockClosedSharp
} from 'ionicons/icons';
import VirtualScroll from './VirtualScroll.vue';
import { UserSettings } from "../../services/UserSettings";
import { Locale } from "../../services/Locale";
import { Utils } from "../../services/Utils";

export default defineComponent({
  components: {
    VirtualScroll,
    IonIcon,
    IonListHeader,
    IonLabel
  },
  data() {
    return {
      details:{} as Record<string,any>,
      flags:{} as Record<string,any>
    }
  },
  setup() {
    return { 
      Utils,
      Locale,
      lockClosedOutline,
      lockClosedSharp
    }
  },
  created() {
    this.details = inject('details') as Record<string,any>;
  },
  methods: {
    flagAttributes(adress: string) {
      if(UserSettings.state.ipFlags){
        if(!this.flags[adress]){
          this.loadFlag(adress);
        }
        return this.flags[adress];
      }
    },
    async countryName(adress: string) {
      Utils.responseToast(this.flags[adress].title)
    },
    async loadFlag(adress: string){
      const ipDetails = await Utils.ipToCountry(adress);
      if(ipDetails){
        this.flags[adress] = {
          src:'https://www.countryflags.io/'+ipDetails.countryCode+'/shiny/24.png',
          title:ipDetails.country
        }
      }
    }
  }
})
</script>

<style scoped>
ion-icon,img.flag {
  vertical-align: -2px;
}

#top {
  text-align: left;
  color:var(--ion-color-medium);
  text-transform: lowercase;
}

img.icon {
  height:10px;
}

img.flag {
  object-fit: cover;
  height: 16px;
  width: max-content;
}


.peer {
  height:48px;
  border-bottom: 1px solid var(--ion-border-color);
  text-align:left;
  padding:5px;
}

.main {
  display:flex;
  flex-flow: wrap;
  flex-direction: row;
  font-size:1rem;
  height:20px;
  margin-bottom:2px;
  overflow: hidden;
}

.bloc {
  height:18px;
  white-space: nowrap;
  margin-right:4px;
}
.bloc.fit {
  flex: 0 0 auto;
}
.bloc.truncate {
  flex: 1 1 1%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.bloc.right {
  text-align: right;
  margin-right:0px;
}

.details {
  font-size: 14px;
  color:var(--ion-color-medium);
  height: 1rem;
  overflow: hidden;
}
</style>