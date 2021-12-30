declare module '*.vue' {
  import { defineComponent } from 'vue'
  const component: ReturnType<typeof defineComponent>
  export default component
}

declare module 'swiper/vue' {
  import _Vue from 'vue';
  export class Swiper extends _Vue {}
  export class SwiperSlide extends _Vue {}
}

declare module '@ionic/core/dist/collection/components/modal/animations/ios.enter';
declare module '@ionic/core/dist/collection/components/modal/animations/ios.leave';
declare module '@ionic/core/dist/collection/components/modal/animations/md.enter';
declare module '@ionic/core/dist/collection/components/modal/animations/md.leave';