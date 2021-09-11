import {Locale} from "./Locale";
import * as Plurals from 'make-plural/plurals';

import en from "../../public/locales/en.json";

const languages: Record<string,any> = {en};
const fileNames: Record<string,any> = {
    es:'es-cr'
}

export const LocaleController = {
    async setLanguage(language: string): Promise<void> {
        if(!languages[language]) {
            await this.loadLanguages(language)
                .then((data) => {
                    languages[language]=data;
                    Locale.setContent(languages);
                })
                .catch(()=> {return})
        }
        Locale.setLanguage(language);
    },
    loadLanguages(code: string): Promise<Record<string,any>> {
        return fetch(`locales/${fileNames[code]||code}.json`)
            .then((response) => response.json())
    },
    getPlural(key: string, count: number): string {
        const lang = Locale.getLanguage();
        const form = Object(Plurals)[lang] ? Object(Plurals)[lang](count) : "other";
        return Object(Locale)[key][form];
    }
}