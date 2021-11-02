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