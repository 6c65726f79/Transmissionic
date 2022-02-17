import { reactive } from 'vue';
import { isPlatform } from "@ionic/vue";
import { Emitter } from './Emitter';
import Swiper from 'swiper';

import 'swiper/css/bundle'

export default class TabController {
  state = reactive({
    selectedTab:0,
    visibleTab:0,
    swiper:{} as Swiper,
    segments:{} as Record<string,any>
  })

  constructor() {
    Emitter.on("next-tab", () => { this.setTab(this.state.selectedTab-0+1) });
    Emitter.on("previous-tab", () => { this.setTab(this.state.selectedTab-1) });
  }

  init(swiper: unknown, segments: unknown): void {
    const self = this;

    this.state.swiper = new Swiper(swiper as HTMLElement, {
      centeredSlides:true,
      initialSlide:this.state.selectedTab,
      resistanceRatio:isPlatform("ios") ? 0.85 : 0,
      simulateTouch:false,
      on: {
        transitionEnd: () => self.slideChanged()
      }
    });
      
    this.state.segments = segments as Record<string,any>;
  }

  setTab(index: number, smooth=true): void {
    index = parseInt(index.toString());
    if(index >= 0 && index <= this.state.segments.$el.childNodes.length){
      if(this.state.swiper){
        this.state.swiper.slideTo(index);
      }
      else {
        this.state.selectedTab=index;
        this.state.visibleTab=index;
      }
      
      const segment = this.state.segments.$el.childNodes[index];
      segment.scrollIntoView({
        behavior: smooth ? 'smooth' : 'instant',
        block: 'center',
        inline: 'center'
      });
    }
      
  }

  async slideChanged(): Promise<void> {
    const activeIndex = this.state.swiper.activeIndex;
    if(activeIndex!=null){
      this.state.selectedTab=activeIndex;
      this.state.visibleTab=activeIndex;
      this.setTab(activeIndex, false);
    }
  }

  isVisible(id: number): boolean{
    return (this.state.visibleTab >= id-1 && this.state.visibleTab <= id+1);
  }
  
}