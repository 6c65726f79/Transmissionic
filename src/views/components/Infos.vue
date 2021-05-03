<template>
  <ion-content class="ion-padding" ref="content" v-if="details">
    <ion-list>
      <ion-list-header>
        {{ Locale.informations }}
      </ion-list-header>
      <ion-item>
        <ion-label class="label no-wrap">
          <div>{{ Locale.name }}</div>
          <span class="selectable">{{ details.name }}</span>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label class="label no-wrap">
          <div>{{ Locale.downloadDir }}</div>
          <span class="selectable">{{ details.downloadDir }}</span>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label class="label">
          <div>{{ Locale.totalSize }}</div>
          <span class="selectable">
            {{ Utils.formatBytes(details.totalSize) }}
            <template v-if="details.totalSize != details.sizeWhenDone">
              ({{ Utils.formatBytes(details.sizeWhenDone) }} {{ Locale.selected.one }})
            </template>
          </span>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label class="label">
          <div>{{ Locale.files }}</div>
          <span class="selectable">{{ details.files.length }}</span>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label class="label">
          <div>{{ Locale.pieces }}</div>
          <span class="selectable">{{ details.pieceCount }} x {{ Utils.formatBytes(details.pieceSize) }}</span>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label class="label no-wrap">
          <div>{{ Locale.createdBy }}</div>
          <span class="selectable">{{ details.creator }}</span>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label class="label">
          <div>{{ Locale.createdOn }}</div>
          <span class="selectable">{{ Utils.secondsToDate(details.dateCreated, true) }}</span>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label class="label">
          <div>{{ Locale.addedOn }}</div>
          <span class="selectable">{{ Utils.secondsToDate(details.addedDate, true) }}</span>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label class="label">
          <div>{{ Locale.completedOn }}</div>
          <span class="selectable">{{ Utils.secondsToDate(details.doneDate, true) }}</span>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label class="label no-wrap">
          <div>{{ Locale.comment }}</div>
          <span class="selectable" v-html="Utils.autoLink(details.comment)"></span>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label class="label no-wrap">
          <div>{{ Locale.hash }}</div>
          <span class="selectable">{{ details.hashString }}</span>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label class="label">
          <div>{{ Locale.magnet }}</div>
          <a :href="details.magnetLink">{{ details.magnetLink }}</a>
        </ion-label>
      </ion-item>
    </ion-list>

    <ion-list>
      <ion-list-header>
        {{ Locale.transfer }}
      </ion-list-header>

      <ion-item>
        <ion-label class="label">
          <div>{{ Locale.status }}</div>
          <span class="selectable">
            {{ statusText[details.status] }}
            <template v-if="details.status==2">
              ({{ Math.round((details.recheckProgress*100+ Number.EPSILON) * 100) / 100 }}%)
            </template>
          </span>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label class="label">
          <div>{{ Locale.tracker.one }}</div>
          <span class="selectable">{{ details.trackers.length>0 ? Utils.trackerDomain(details.trackers[0].announce).domain : null }}</span>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label class="label no-wrap">
          <div>{{ Locale.error }}</div>
          <span class="selectable">{{ details.errorString }}</span>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label class="label">
          <div>{{ Locale.lastActivity }}</div>
          <span class="selectable">{{ Utils.secondsToDate(details.activityDate, true) }}</span>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label class="label">
          <div>{{ Locale.downloaded }}</div>
          <span class="selectable">{{ Utils.formatBytes(details.downloadedEver) }}</span>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label class="label">
          <div>{{ Locale.uploaded }}</div>
          <span class="selectable">{{ Utils.formatBytes(details.uploadedEver) }}</span>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label class="label">
          <div>{{ Locale.shareRatio }}</div>
          <span class="selectable">{{ Utils.getRatio(details.uploadRatio, 10) }}</span>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label class="label">
          <div>{{ Locale.downloadTime }}</div>
          <span class="selectable">{{ Utils.durationToString(details.secondsDownloading*1000) }}</span>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label class="label">
          <div>{{ Locale.seedTime }}</div>
          <span class="selectable">{{ Utils.durationToString(details.secondsSeeding*1000) }}</span>
        </ion-label>
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
} from '@ionic/vue';
import { Locale } from "../../services/Locale";
import { Utils } from "../../services/Utils";

export default defineComponent({
  components: {
    IonContent,
    IonList,
    IonItem,
    IonListHeader,
    IonLabel,
  },
  data() {
    return {
      details:{} as Record<string,any>,
      statusText:[
        Locale.filters.stopped,
        "1",
        Locale.filters.verifying,
        Locale.filters.queued,
        Locale.filters.downloading,
        "5",
        Locale.filters.seeding
      ]
    }
  },
  setup() {
    return { 
      Utils,
      Locale
    }
  },
  created() {
    this.details = inject('details') as Record<string,any>;
  },
  mounted() {
    Utils.customScrollbar(this.$refs.content)
  }
})
</script>

<style scoped>
.label {
  margin: 8px 0px;
}
.label.no-wrap {
  white-space: normal;
}
.label > div {
  -webkit-transform: translateY(10%) scale(0.75);
  transform: translateY(10%) scale(0.75);
  -webkit-transform-origin: left top;
  transform-origin: left top;
}
.label > span:empty:after {
  content:" ";
  white-space: pre;
}
</style>