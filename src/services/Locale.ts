import LocalizedStrings from 'localized-strings';

import English from "../locales/en.json";
import French from "../locales/fr.json";
import Spanish from "../locales/es.json";

export const Locale = new LocalizedStrings({
  en:English,
  fr:French,
  es:Spanish 
});