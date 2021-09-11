import { reactive } from 'vue';
import { isPlatform } from "@ionic/vue";
import { Emitter } from './Emitter';

export default class TabController {
    state = reactive({
        selectedTab:0,
        visibleTab:0,
        slider:{} as Record<string,any>,
        segments:{} as Record<string,any>
    })

    slidesOptions = {
        centeredSlides:true,
        initialSlide:this.state.selectedTab,
        resistanceRatio:isPlatform("ios") ? 0.85 : 0,
        simulateTouch:false,
        keyboard: {
            enabled: true
        }
    }

    constructor() {
        Emitter.on("next-tab", () => { this.setTab(this.state.selectedTab-0+1) });
        Emitter.on("previous-tab", () => { this.setTab(this.state.selectedTab-1) });
    }

    setElements(slider: unknown, segments: unknown): void{
        this.state.slider = slider as Record<string,any>;
        this.state.segments = segments as Record<string,any>;
    }

    setTab(index: number, smooth=true): void {
        index = parseInt(index.toString());
        if(index >= 0 && index <= this.state.segments.$el.childNodes.length){
            if(this.state.slider){
                this.state.slider.$el.slideTo(index);
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
        const activeIndex = await this.state.slider.$el.getActiveIndex();
        this.state.selectedTab=activeIndex;
        this.state.visibleTab=activeIndex;
        this.setTab(activeIndex, false);
      }

    isVisible(id: number): boolean{
        return (this.state.visibleTab >= id-1 && this.state.visibleTab <= id+1);
    }
    
}