import {Locale} from "./Locale";
import {Emitter} from "./Emitter";

import English from "../../public/locales/en.json";

const languages: Record<string,any> = {en:English};
const fileNames: Record<string,any> = {
    en:'en',
    fr:'fr',
    ru:'ru',
    es:'es-cr' 
}

export const LocaleController = {
    async setLanguage(language: string): Promise<void> {
        if(!languages[language] && fileNames[language]) {
            const data = await fetch(`locales/${fileNames[language]}.json`)
                .then((response) => response.json())
                .catch(()=> {return})
            languages[language]=data;
            Locale.setContent(languages);
        }
        Locale.setLanguage(language);
        Emitter.emit("language-changed");
    }
}