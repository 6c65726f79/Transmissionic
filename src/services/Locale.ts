import LocalizedStrings from 'localized-strings';

import English from "../locales/en.json";
import French from "../locales/fr.json";
import Russian from "../locales/ru.json";
import SpanishCR from "../locales/es-cr.json";

export const Locale = new LocalizedStrings({
  en:English,
  fr:French,
  ru:Russian,
  es:SpanishCR 
});