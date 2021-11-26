<template>
  <ion-content :fullscreen="fullscreen" ref="virtualscroll">
    <slot name="fab"></slot>

    <RecycleScroller
      class="scroller"
      ref="scroller"
      :items="items"
      :item-size="itemSize"
      :key-field="keyField"
    >
      <template v-slot:before>
        <slot name="start"></slot>

        <div class="placeholder" v-if="items.length==0">
          <strong class="capitalize">{{ Locale.empty }}</strong>
          <p><slot name="search"></slot></p>
        </div>
      </template>

      <template v-slot:default="{item}">
        <slot :item="item"></slot>
      </template>
    </RecycleScroller>
    
  </ion-content>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { 
  IonContent, 
} from '@ionic/vue';
import { Locale } from "../../services/Locale";
import { Utils } from "../../services/Utils";

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

export default defineComponent({
  props: ['items','itemSize',"keyField","fullscreen"],
  data() {
    return {
      scrollIndex:0,
      lastScrollTop:0
    }
  },
  components: {
    IonContent,
  },
  setup() {
    return {
      Locale
    }
  },
  mounted() {
    const scroller = this.$refs.scroller as any;

    Utils.customScrollbar(scroller, true, false);

    scroller.$el.addEventListener("scroll", () => this.handleScroll(scroller), false);
  },
  methods: {
    handleScroll (element: Record<string,any>) {
      const container = this.$refs.virtualscroll as Record<string,any>;
      const st = element.$el.scrollTop;
      container.$el.classList.toggle("no-fab", (st > this.lastScrollTop));
      this.lastScrollTop = st <= 0 ? 0 : st;
    }
  }
})
</script>

<style scoped>
.scroller {
  height:100%;
}

.placeholder {
  position: absolute;
  width:100%;
  top: 50%;
  transform: translateY(-50%);
  text-align:center;
}

.placeholder strong {
  font-size: 20px;
  line-height: 26px;
}
</style>