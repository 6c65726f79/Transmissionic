<template>
  <ion-list lines="none">
    <ion-item button v-for="order in privateState.orders" :key="order.value" @click="setOrder(order.value)" detail="false">
      {{ order.label }}
      <ion-icon
        v-if="sharedState.orderBy==order.value"
        :ios="sharedState.reverse ? caretDownOutline : caretUpOutline"
        :md="sharedState.reverse ? caretDownSharp : caretUpSharp" slot="end"></ion-icon>
    </ion-item>
  </ion-list>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { 
  popoverController,
  IonList,
  IonItem,
  IonIcon
} from '@ionic/vue';
import {
  caretDownOutline,
  caretUpOutline,
  caretDownSharp,
  caretUpSharp
} from 'ionicons/icons';
import { UserSettings } from "../../services/UserSettings";
import { Locale } from "../../services/Locale";
import { Utils } from "../../services/Utils";

export default defineComponent({
  name: 'OrderPopover',
  components: { 
    IonList,
    IonItem,
    IonIcon
  },
  data() {
    return {
      sharedState: UserSettings.state,
      privateState: {
        orders:[
          {
            value:"name",
            label:Locale.name
          },
          {
            value:"addedDate",
            label:Locale.addedDate
          },
          {
            value:"sizeWhenDone",
            label:Locale.size
          },
          {
            value:"uploadRatio",
            label:Locale.ratio
          },
          {
            value:"uploadedEver",
            label:Locale.uploaded
          },
          {
            value:"rateUpload",
            label:Locale.uploadSpeed
          },
          {
            value:"activityDate",
            label:Locale.lastActivity
          },
          {
            value:"queuePosition",
            label:Locale.queuePosition
          },
        ]
      }
    }
  },
  setup() {
    Utils.pushState();

    return {
      Locale,
      caretDownOutline,
      caretUpOutline,
      caretDownSharp,
      caretUpSharp
    };
  },
  methods: {
    setOrder(order: string) {
      if(order==this.sharedState.orderBy){
        UserSettings.setValue("reverse",!this.sharedState.reverse,true);
      }
      else {
        UserSettings.setValue("orderBy",order,true);
        UserSettings.setValue("reverse",false,true);
      }
      popoverController.dismiss();
    }
  }
});
</script>
