import {Locale} from "./Locale";
import {Emitter} from "./Emitter";

import en from "../../public/locales/en.json";

const languages: Record<string,any> = {en};
const fileNames: Record<string,any> = {
    es:'es-cr'
}

export const LocaleController = {
    async setLanguage(language: string): Promise<void> {
        if(!languages[language]) {
            const data = await fetch(`locales/${fileNames[language]||language}.json`)
                .then((response) => response.json())
                .catch(()=> {return})
            if(data){
                languages[language]=data;
                Locale.setContent(languages);
            }
        }
        Locale.setLanguage(language);
        Emitter.emit("language-changed");
    }
}