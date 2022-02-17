<template>
  <div :class="{ torrent:true, condensed }" tabindex="0">
    <div v-if="orderByPosition" class="order">
      <ion-icon :md="caretUpSharp" :ios="caretUpOutline" color="medium" @click="changeTorrentPosition($event,true)"></ion-icon>
      <ion-icon :md="caretDownSharp" :ios="caretDownOutline" color="medium" @click="changeTorrentPosition($event,false)"></ion-icon>
    </div>
    <div v-else class="control" :class="{ paused: (torrent.status==0) }" @click="switchTorrentState($event)"></div>
    <div class="right">

      <div class="title" :title="torrent.name">
        {{ torrent.name }}
      </div>

      <div :class="{details:true,error:torrent.errorString!=''}">
        <div class="line">
          <!-- Download -->
          <span class="bloc fit">
            <!-- Using PNGs instead of SVGs to improve performance of the virtualscroll -->
            <img class="icon" :src="downIcon" :alt="Locale.downloaded">
            {{ Utils.formatBytes(torrent.downloadedEver) }}
            <template v-if="torrent.rateDownload>1">
              ({{ Utils.formatBytes(torrent.rateDownload,2,true) }})
            </template>
          </span>

          <!-- Upload -->
          <span class="bloc fit">
            <img class="icon" :src="upIcon" :alt="Locale.uploaded">
            {{ Utils.formatBytes(torrent.uploadedEver) }}
            <template v-if="torrent.rateUpload>1">
              ({{ Utils.formatBytes(torrent.rateUpload,2,true) }})
            </template>
          </span>
        </div>

        <div class="line end">
          <!-- Ratio -->
          <span class="bloc fit">
            <img class="icon" :src="bothIcon" alt="Ratio">
            {{ Utils.getRatio(torrent.uploadRatio) }}
          </span>

          <!-- Time remaining -->
          <span class="bloc truncate" v-if="torrent.status==4">
            <ion-icon :md="timeSharp" :ios="timeOutline"></ion-icon>
            {{ Utils.durationToString(torrent.eta*1000) }}
          </span>

          <!-- Verifying -->
          <span class="bloc truncate verifying" v-else-if="torrent.status==2">
            {{Locale.filters.verifying}} ({{Utils.getPercent(torrent.recheckProgress)}})
          </span>
          
          <!-- Queued -->
          <span class="bloc truncate" v-else-if="torrent.status==3">
            <ion-icon :md="hourglassSharp" :ios="hourglassOutline"></ion-icon>
            {{Locale.filters.queued}}
          </span>

          <!-- Error -->
          <span class="bloc truncate error" v-else-if="torrent.errorString!=''" :title="Utils.localizeError(torrent.errorString)">
            <ion-icon :md="warningSharp" :ios="warningOutline"></ion-icon>
            {{ Utils.localizeError(torrent.errorString) }}
          </span>

          <!-- Size / Percent done -->
          <span class="bloc right fit">
            {{ Utils.formatBytes(torrent.sizeWhenDone) }} ({{ Utils.getPercent(torrent.percentDone) }})
          </span>
        </div>
      </div>

      <ion-progress-bar :value="torrent.percentDone" :color="ProgressBarColors[torrent.status]" aria-hidden="true"></ion-progress-bar>
    
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { 
  IonIcon,
  IonProgressBar
} from '@ionic/vue';
import {
  timeSharp,
  timeOutline,
  hourglassSharp,
  hourglassOutline,
  warningSharp,
  warningOutline,
  caretUpSharp,
  caretUpOutline,
  caretDownSharp,
  caretDownOutline
} from 'ionicons/icons';
import { Locale } from "../../services/Locale";
import { Utils } from "../../services/Utils";
import { Emitter } from "../../services/Emitter";
import { UserSettings } from '../../services/UserSettings';

export default defineComponent({
  props: ['torrent'],
  components: {
    IonIcon,
    IonProgressBar,
  },
  data() {
    return {
      downIcon:"./assets/down.png",
      upIcon:"./assets/up.png",
      bothIcon:"./assets/both.png"
    }
  },
  setup() {
    const ProgressBarColors = ["medium","warning","warning","medium","success",null,"primary"];

    return { 
      Locale,
      Utils,
      ProgressBarColors,
      timeSharp,
      timeOutline,
      hourglassSharp,
      hourglassOutline,
      warningSharp,
      warningOutline,
      caretUpSharp,
      caretUpOutline,
      caretDownSharp,
      caretDownOutline
    }
  },
  computed: {
    orderByPosition() {
      return UserSettings.state.orderBy=="queuePosition";
    },
    condensed() {
      return UserSettings.state.condensedMode
    }
  },
  methods: {
    switchTorrentState(e: Event){
      e.stopPropagation();
      Emitter.emit('switch', this.torrent.id)
    },
    changeTorrentPosition(e: Event, up: boolean) {
      e.stopPropagation();
      Emitter.emit("torrent-position",{
        id:this.torrent.id,
        up: up
      })
    }
  }
})
</script>

<style scoped>

img.icon {
  height:10px;
}

.torrent {
  text-align:left;
  height:72px;
  padding:5px;
  display: flex;
}

.torrent.condensed {
  height:46px;
}

.torrent > div {
  display: inline-block;
  vertical-align: top;
}

.torrent .control {
  width:32px;
  height:32px;
  margin: 14px;
  color:var(--ion-color-medium);
  background:url(../../../public/assets/activity.png) no-repeat left center;
  background-size:64px;
  cursor:pointer;
}

.torrent.condensed .control {
  width: 24px;
  height: 24px;
  margin: 7px;
  margin-right: 15px;
  background-size: 48px;
}

.torrent .control.paused {
  background-position:right center;
}

.torrent .order {
  width:20px;
  height:40px;
  margin:10px 20px;
  font-size: 20px;
}

.torrent .order ion-icon {
  cursor:pointer;
}

.torrent .right {
  position: relative;
  width: calc(100% - 62px);
  flex:1;
}

.torrent .title {
  width: 100%;
  font-size:1rem;
  overflow: hidden;
  line-height: 1.2rem;
}

.torrent .details {
  height: 22px;
  display:flex;
  flex-flow: wrap;
  flex-direction: row;
  width:100%;
  font-size: 14px;
  color:var(--ion-color-medium);
  padding-bottom: 6px;
  overflow: hidden;
  position:absolute;
  bottom:0;
  line-height: 18px;
}

.torrent.condensed .details {
  bottom: -7px;
}

.torrent .details > * {
  white-space: nowrap;
}

.torrent .details .error {
  color:var(--ion-color-danger);
}

.torrent .details .verifying {
  color:var(--ion-color-warning);
}

.torrent .details .bloc {
  height:18px;
  margin-right:4px;
}

.torrent .details .fit {
  flex: 0 0 auto;
}
.torrent .details .truncate {
  flex: 1 1 1%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.torrent .details .bloc.right {
  margin-right:0px;
  float: right;
  width: auto;
  margin-left: auto;
}

.torrent .details .line {
  height: 18px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: max-content;
}

.torrent .details .end {
  flex: 1;
  display: flex;
  max-width: inherit;
}

.torrent ion-progress-bar {
  position:absolute;
  bottom:0;
  left:0;
  width:100%;
}

.torrent.condensed ion-progress-bar {
  bottom: -4px;
  left: -5px;
  width: calc(100% + 10px);
  height: calc(100% + 8px);
  z-index: -1;
  opacity: .2;
}

.torrent .details ion-icon {
  vertical-align:-2px;
}

.torrent.selected {
  background: rgba(var(--ion-color-primary-rgb), 0.14);
}

.torrent.selected .title {
  color: var(--ion-color-primary)
}

.torrent.condensed .title {
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 800px) {
  .torrent .title {
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .torrent:not(.condensed) .details {
    height: 40px;
    flex-direction: column;
  }

  .torrent:not(.condensed) .details .line {
    width: 100%;
  }

  .torrent.condensed .details.error .bloc {
    display:none;
  }

  .torrent.condensed .details.error .error {
    display:block;
  }
}

@media (min-width: 800px) {
  .torrent:not(.condensed) .title {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}
</style>