<template>
  <ion-content ref="content">
    <ion-list-header id="top">
      <ion-label>
        {{trackerCount}}
        {{trackerCount > 1 ? Locale.tracker.other : Locale.tracker.one }}
      </ion-label>
    </ion-list-header>
    <template v-for="tracker in displayedTrackerList" :key="tracker.id">
      <ion-card>
        <ion-item>
          <ion-label>
            <ion-badge color="primary">{{ Locale.tier }} {{ tracker.tier+1 }}</ion-badge>
            <ion-badge color="dark">{{ Utils.trackerDomain(tracker.host).protocol }}</ion-badge>
            {{ Utils.trackerDomain(tracker.host).domain }}
          </ion-label>
          <ion-buttons slot="end">
            <ion-button fill="clear" color="dark" @click="trackerActions(tracker)">
              <ion-icon slot="icon-only" :ios="ellipsisVerticalOutline" :md="ellipsisVerticalSharp"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-item>

        <ion-card-content>
          <p>
            <strong>{{ Locale.address }}</strong><br>
            <span class="selectable">{{ tracker.announce }}</span><br>
          </p>
          <p v-if="tracker.announceState!==0">
            <strong>{{ Locale.announce }}</strong><br>
            {{ Locale.state }} :
            <template v-if="tracker.announceState==3">
              <ion-icon color="warning" :ios="syncCircleOutline" :md="syncCircleSharp"></ion-icon>
              {{ Locale.updating }}
            </template>
            <template v-else>
              <template v-if="tracker.lastAnnounceSucceeded">
                <ion-icon color="success" :ios="checkmarkCircleOutline" :md="checkmarkCircleSharp"></ion-icon>
                {{ Locale.working }}
              </template>
              <span v-else class="error selectable">
                {{ tracker.lastAnnounceResult }}
              </span>
              <template v-if="tracker.lastAnnounceSucceeded || tracker.lastAnnounceResult.length>0">
                ({{ Utils.timeSince(tracker.lastAnnounceTime) }})
              </template>
            </template>
            <br>
            {{ Locale.peerCount }} : {{ tracker.lastAnnouncePeerCount>=0 ? tracker.lastAnnouncePeerCount : "?" }}<br>
            {{ Locale.lastUpdate }} : {{ Utils.secondsToDate(tracker.lastAnnounceTime, false, true) }}<br>
            {{ Locale.nextUpdate }} : {{ Utils.secondsToDate(tracker.nextAnnounceTime, false, true) }}<br>
          </p>
          <p v-if="tracker.scrapeState!==0 && tracker.scrapeState!=2">
            <strong>{{ Locale.scrape }}</strong><br>
            {{ Locale.state }} :
            <template v-if="tracker.scrapeState==3">
              <ion-icon color="warning" :ios="syncCircleOutline" :md="syncCircleSharp"></ion-icon>
              {{ Locale.updating }}
            </template>
            <template v-else>
              <template v-if="tracker.lastScrapeSucceeded">
                <ion-icon color="success" :ios="checkmarkCircleOutline" :md="checkmarkCircleSharp"></ion-icon>
                {{ Locale.working }}
              </template>
              <span v-else-if="tracker.lastScrapeResult.length>0" class="error selectable">
                {{ tracker.lastScrapeResult }}
              </span>
              <template v-else>
                {{ Locale.filters.waiting }}
              </template>
              <template v-if="tracker.lastScrapeSucceeded || tracker.lastScrapeResult.length>0">
                ({{ Utils.timeSince(tracker.lastScrapeTime) }})
              </template>
            </template>
            <br>
            <template v-if="tracker.seederCount>=0">
              {{ Locale.seeders }} : {{ tracker.seederCount }}<br>
            </template>
            <template v-if="tracker.leecherCount>=0">
              {{ Locale.leechers }} : {{ tracker.leecherCount }}<br>
            </template>
            <template v-if="tracker.downloadCount>=0">
              {{ Locale.downloadCount }} : {{ tracker.downloadCount }}<br>
            </template>
            {{ Locale.lastUpdate }} : {{ Utils.secondsToDate(tracker.lastScrapeTime, false, true) }}<br>
            {{ Locale.nextUpdate }} : {{ Utils.secondsToDate(tracker.nextScrapeTime, false, true) }}<br>
          </p>
        </ion-card-content>
      </ion-card>
    </template>

    <ion-infinite-scroll @ionInfinite="displayMore($event)" threshold="100px">
      <ion-infinite-scroll-content loading-spinner="circular">
        <ion-button fill="clear" color="dark" @click="displayMore()" :disabled="displayedCount>=trackerCount">
          {{ Locale.displayMore }}
        </ion-button>
      </ion-infinite-scroll-content>
    </ion-infinite-scroll>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed" @click="addTracker()">
      <ion-fab-button>
        <ion-icon :icon="add"></ion-icon>
      </ion-fab-button>
    </ion-fab>
  </ion-content>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';
import { 
  actionSheetController,
  alertController,
  IonContent,
  IonItem,
  IonLabel,
  IonCard,
  IonCardContent,
  IonIcon,
  IonButton,
  IonButtons,
  IonBadge,
  IonInfiniteScroll, 
  IonInfiniteScrollContent,
  IonFab, 
  IonFabButton,
  IonListHeader
} from '@ionic/vue';
import {
  ellipsisVerticalOutline,
  ellipsisVerticalSharp,
  syncCircleOutline,
  syncCircleSharp,
  checkmarkCircleOutline,
  checkmarkCircleSharp,
  add
} from 'ionicons/icons';
import { Locale } from "../../services/Locale";
import { Utils } from "../../services/Utils";
import { TransmissionRPC } from '../../services/TransmissionRPC';

export default defineComponent({
  components: {
    IonContent,
    IonItem,
    IonLabel,
    IonCard,
    IonCardContent,
    IonIcon,
    IonButton,
    IonButtons,
    IonBadge,
    IonInfiniteScroll, 
    IonInfiniteScrollContent,
    IonFab, 
    IonFabButton,
    IonListHeader
  },
  data() {
    return {
      details:{} as Record<string,any>,
      displayedCount: 0,
    }
  },
  setup() {
    return { 
      Utils,
      Locale,
      ellipsisVerticalOutline,
      ellipsisVerticalSharp,
      syncCircleOutline,
      syncCircleSharp,
      checkmarkCircleOutline,
      checkmarkCircleSharp,
      add
    }
  },
  created() {
    this.details = inject('details') as Record<string,any>;
    this.displayMore();
  },
  mounted() {
    Utils.customScrollbar(this.$refs.content)
  },
  computed: {
    displayedTrackerList: function(): Array<any> {
      const result: Array<any> = [];
      for(let i = 0; i < this.displayedCount; i++){
        if(this.details.trackerStats[i]){
          result.push(this.details.trackerStats[i]);
        }
      }
      
      return result;
    },
    trackerCount: function(): number {
      return this.details.trackerStats.length
    }
  },
  methods: {
    displayMore(ev?: any) {
      if(this.details){
        this.displayedCount=this.displayedCount+5;
      }
      if(this.displayedCount>this.trackerCount){
        this.displayedCount=this.trackerCount;
      }

      if(ev){
        ev.target.complete();
      }
    },
    async addTracker(){
      const alert = await alertController
        .create({
          header: Locale.addTracker,
          inputs: [
            {
              name: 'address',
              placeholder: Locale.address
            }
          ],
          buttons: [
            {
              text: Locale.actions.cancel,
              role: 'cancel'
            },
            {
              text: Locale.ok,
              handler: (data) => {
                const args = {
                  trackerAdd:[data.address]
                }

                TransmissionRPC.invalidatePersitentData();

                TransmissionRPC.torrentAction("set", this.details.id, args)
                  .then((response) => {
                    Utils.responseToast(response.result);
                    if(response.result=="success"){
                      const domainDetails = Utils.trackerDomain(data.address);
                      const newId = this.details.trackerStats.length;
                      const newTracker = {
                        id:newId,
                        tier:this.details.trackerStats.length>0 ? this.details.trackerStats[this.details.trackerStats.length-1].tier+1 : 0,
                        announce:data.address,
                        host:domainDetails.protocol+"://"+domainDetails.domain+":"+domainDetails.port,
                        announceState:0,
                        scrapeState:0
                      }
                      this.details.trackerStats[newId] = newTracker;

                      if(this.displayedCount==this.trackerCount-1){
                        this.displayMore();
                      }
                    }
                  })
              },
            },
          ],
        });
      return alert.present();
    },
    async editTracker(tracker: Record<string,any>){
      const alert = await alertController
        .create({
          header: Locale.actions.editAddress,
          inputs: [
            {
              name: 'address',
              value: tracker.announce,
            }
          ],
          buttons: [
            {
              text: Locale.actions.cancel,
              role: 'cancel'
            },
            {
              text: Locale.ok,
              handler: (data) => {
                const args = {
                  trackerReplace:[tracker.id,data.address]
                }

                TransmissionRPC.invalidatePersitentData();

                TransmissionRPC.torrentAction("set", this.details.id, args)
                  .then((response) => {
                    Utils.responseToast(response.result)
                    if(response.result=="success"){
                      const domainDetails = Utils.trackerDomain(data.address);
                      this.details.trackerStats[tracker.id].announce = data.address;
                      this.details.trackerStats[tracker.id].host = domainDetails.protocol+"://"+domainDetails.domain+":"+domainDetails.port
                    }
                  });
              },
            },
          ],
        });
      return alert.present();
    },
    async trackerActions(tracker: Record<string,any>) {
      const actionSheet = await actionSheetController
        .create({
          header: Utils.trackerDomain(tracker.host).domain,
          buttons: [
            {
              text: Locale.actions.editAddress,
              handler: () => {
                this.editTracker(tracker);
              },
            },
            {
              text: Locale.actions.remove,
              role: 'destructive',
              handler: () => {
                // Remove tracker
                const args = {
                  "trackerRemove":[tracker.id]
                }
                
                TransmissionRPC.invalidatePersitentData();

                TransmissionRPC.torrentAction("set", this.details.id, args)
                  .then((response) => {
                    Utils.responseToast(response.result);
                    if(response.result=="success"){
                      const index = this.details.trackerStats.indexOf(tracker)
                      if(index !== -1) {
                        this.details.trackerStats.splice(index, 1);
                      }
                    }
                  })
              },
            },
            {
              text: Locale.actions.cancel,
              role: 'cancel'
            },
          ],
        });
      return actionSheet.present();
    },
  }
})
</script>

<style scoped>
ion-badge {
  vertical-align: middle;
  margin-left: 4px;
}

body:not(.dark) ion-card, body:not(.dark) ion-card ion-item {
  --background:var(--ion-color-light);
}

ion-card-content {
  text-align: left;
}

ion-card-content ion-icon {
  vertical-align: middle;
}

.error {
  color:var(--ion-color-danger);
}

#top {
  text-align: left;
  color:var(--ion-color-medium);
  text-transform: lowercase;
}
</style>