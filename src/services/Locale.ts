import { reactive } from 'vue';
import LocalizedStrings from 'localized-strings';

import en from "../../public/locales/en.json";

export const Locale = reactive(new LocalizedStrings({en}));