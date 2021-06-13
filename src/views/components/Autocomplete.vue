<!--
 Autocomplete component for Ionic, based on https://codepen.io/alligatorio/pen/mXRGLg
-->

<template>
  <div class="autocomplete-wrapper">
    <ion-input
      v-bind="$attrs"
      v-model="search"
      :placeholder="placeholder"
      @click="onChange"
      @input="onChange"
      @keydown.down="onArrowDown"
      @keydown.up="onArrowUp"
      @keydown.enter="onEnter">
    </ion-input>
    <div
      id="autocomplete-results"
      v-show="isOpen && results.length>0"
      class="autocomplete-results"
      ref="results">
      <ion-list lines="none">
        <ion-item
          button
          v-for="(result, i) in results"
          :key="i"
          @click="setResult(result)"
          @mousedown="$event.stopPropagation()"
          class="autocomplete-result"
          :class="{ 'is-active': i === arrowCounter }"
          detail="false">
          <ion-label class="item text-wrap">
            {{ result }}
          </ion-label>
        </ion-item>
      </ion-list>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { 
  IonInput,
  IonList,
  IonItem,
  IonLabel
} from '@ionic/vue';
import { Utils } from "../../services/Utils";

export default defineComponent({
	name: 'autocomplete',
  props: {
    items: {
      type: Array,
      required: false,
      default: () => [],
    },
    placeholder: {
      type: String,
      required: false,
      default: () => ""
    },
    value: {
      type: String,
      required: false,
      default: () => ""
    }
  },
  components: { 
    IonInput,
    IonList,
    IonItem,
    IonLabel
  },
  data() {
    return {
      isOpen: false,
      results: [],
      search: '',
      arrowCounter: 0,
    };
  },
  methods: {
    onChange(e) {
      // Let's warn the parent that a change was made
      this.search = e.target.value;
      this.$emit('update', this.search);

      // Let's  our flat array
      this.filterResults();
      this.isOpen = true;
    },

    filterResults() {
      // first uncapitalize all the things
      this.results = this.items.filter((item) => {
        return item.toLowerCase().indexOf(this.search.toLowerCase()) > -1;
      }).slice(0,20);
    },
    setResult(result) {
      this.search = result;
      this.isOpen = false;
      this.$emit('update', this.search);
    },
    onArrowDown() {
      if (this.arrowCounter < this.results.length) {
        this.arrowCounter = this.arrowCounter + 1;
      }
    },
    onArrowUp() {
      if (this.arrowCounter > 0) {
        this.arrowCounter = this.arrowCounter -1;
      }
    },
    onEnter() {
      this.search = this.results[this.arrowCounter];
      this.isOpen = false;
      this.arrowCounter = -1;
    },
    handleClickOutside(evt) {
      if (!this.$el.contains(evt.target)) {
        this.isOpen = false;
        this.arrowCounter = -1;
      }
    }
  },
  watch: {
    items: function (val, oldValue) {
      // actually compare them
      if (val.length !== oldValue.length) {
        this.results = val;
      }
    },
    value: function (val) {
      this.search = val;
    }
  },
  mounted() {
    Utils.customScrollbar(this.$refs.results, false, false);
    this.search = this.value;
    document.addEventListener('mousedown', this.handleClickOutside)
  },
  unmounted() {
    document.removeEventListener('mousedown', this.handleClickOutside)
  }
})
</script>

<style scoped>
  .autocomplete-wrapper {
    width: 100%;
    position: relative;
  }

  .autocomplete-results {
    padding: 0;
    margin: 0;
    max-height: 200px;
    overflow: auto;
    width:100%;
    position: absolute;
    z-index: 10;
    bottom: -1px;
    background: var(--ion-item-background, var(--ion-background-color, #fff));
    transform: translateY(100%);
  }

  .md .autocomplete-results {
    border-radius: 4px;
    box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
  }

  .ios .autocomplete-results {
    border-radius: 10px;
  }

  .autocomplete-result {
    --highlight-background:none;
  }

  .autocomplete-result ion-label {
    text-overflow:initial;
    white-space:normal;
    max-width:none;
  }
</style>