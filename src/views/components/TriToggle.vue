<!--
    Multiple state toggle
-->

<template>
    <span class="swiper-no-swiping">
        <ion-toggle v-model="checked"></ion-toggle>
    </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { 
  IonToggle,
} from '@ionic/vue';

export default defineComponent({
    props: ['value','true','false'],
    components: {
        IonToggle,
    },
    computed: {
        checked: {
            get(): boolean {
                return this.value===this.true
            },
            set (checked: boolean) {
                let value = checked ? this.true : this.false;
                if(this.value!==this.true && this.value!==this.false){
                    value=this.value;
                }
                this.$emit('update', {checked,value});
            }
        }
    }
})
</script>

