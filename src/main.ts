import { IonicVue, isPlatform } from '@ionic/vue';
import { createApp } from 'vue'
import App from './views/App.vue'
import router from './router';
import VueVirtualScroller from 'vue-virtual-scroller'

import { defineCustomElements } from '@ionic/pwa-elements/loader';

import { FileHandler } from "./services/FileHandler";
import { Shortcuts } from "./services/Shortcuts";
import { Locale } from "./services/Locale";
import { Utils } from "./services/Utils";

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';
import './theme/style.css';

defineCustomElements(window);

FileHandler.listenFileOpen();

Shortcuts.listenKeys();

const app = createApp(App)
  .use(IonicVue, {
    /*mode: "ios",*/
    backButtonText: isPlatform('ios') ? Locale.actions.back : null
  })
  .use(router)
  .use(VueVirtualScroller)

// Temporary fix injected property warn
app.config.unwrapInjectedRef = true;

Utils.customDirectives(app);

if(isPlatform("electron")){
  Utils.customTitlebar();
}

if(isPlatform("ios") && isPlatform("mobileweb")){
  Utils.loadAppleTouchIcon();
}

Utils.backButtonHandle();

router.isReady().then(() => {
  app.mount('#app');
});