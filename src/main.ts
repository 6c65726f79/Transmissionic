import { IonicVue, isPlatform } from '@ionic/vue';
import { createApp } from 'vue'
import App from './views/App.vue'
import router from './router';

import { defineCustomElements } from '@ionic/pwa-elements/loader';

import { FileHandler } from "./services/FileHandler";
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

/* Flags css */
import 'country-flag-icons/3x2/flags.css';

/* Theme variables */
import './theme/variables.css';
import './theme/style.css';

defineCustomElements(window);

FileHandler.listenFileOpen();

const app = createApp(App)
  .use(IonicVue, {
    /*mode: "ios",*/
    backButtonText: isPlatform('ios') ? Locale.actions.back : null
  })
  .use(router)

Utils.customDirectives(app);

if(isPlatform("electron")){
  Utils.customTitlebar();
}

Utils.backButtonHandle();

router.isReady().then(() => {
  app.mount('#app');
});