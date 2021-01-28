<template>
  <ion-content :fullscreen="fullscreen" ref="virtualscroll" :scroll-events="true" @ionScroll="handleScroll($event)">
    <slot name="start"></slot>
    <div class="wrapper" ref="wrapper" v-if="virtualList.length>0">
      <div class="visiblePart" ref="visiblePart">
        <slot v-for="item in virtualList" :key="item[keyField]" :item="item"></slot>
      </div>
    </div>
    <div class="placeholder" v-else>
      <strong class="capitalize">{{ Locale.empty }}</strong>
      <p><slot name="search"></slot></p>
    </div>
    <slot name="fab"></slot>
  </ion-content>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { 
  IonContent, 
} from '@ionic/vue';
import { Locale } from "../../services/Locale";
import { Utils } from "../../services/Utils";

export default defineComponent({
  props: ['items','itemSize',"keyField","fullscreen"],
  data() {
    return {
      scrollIndex:0,
    }
  },
  components: {
    IonContent,
  },
  computed: {
    virtualList: function (): Array<any> {
      const margin=10;
      const virtualscroll = this.$refs.virtualscroll as Record<string,any>;
      const scrollheight = virtualscroll?.$el.offsetHeight || window.innerHeight;
      let visibleCount = Math.floor(scrollheight/this.itemSize)+margin;
      visibleCount += (this.scrollIndex>margin/2) ? margin : this.scrollIndex;
      const start = (this.scrollIndex-margin>=0) ? this.scrollIndex-margin : 0
      const end = (start+visibleCount<=this.items.length) ? start+visibleCount : this.items.length
      
      this.setWrapperHeight()

      const visible = this.$refs.visiblePart as Record<string,any>;
      if(visible){
        visible.style.top=start*this.itemSize+"px";
      }
      return this.items.slice(start, end);
    }
  },
  setup() {
    return {
      Locale
    }
  },
  mounted() {
    // Custom scrollbar for Web Browser and Electron
    Utils.customScrollbar(this.$refs.virtualscroll);
    this.setWrapperHeight();
  },
  methods: {
    handleScroll (event: any) {
      this.scrollIndex=Math.floor(event.detail.scrollTop/this.itemSize);
      
      const container = this.$refs.virtualscroll as Record<string,any>;
      if(event.detail.velocityY>0){
        container.$el.classList.add("no-fab");
      }
      else {
        container.$el.classList.remove("no-fab");
      }
    },
    setWrapperHeight() {
      const inner = this.$refs.wrapper as Record<string,any>;
      if(inner){
        inner.style.height=this.items.length*this.itemSize+"px";
      }
    }
  }
})
</script>

<style scoped>
.wrapper {
  width:100%;
  position: relative;
}

.visiblePart {
  position:absolute;
  width:100%;
  padding-bottom: var(--offset-bottom); /* Fix for Firefox */
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