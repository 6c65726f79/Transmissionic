import { Emitter } from "./Emitter";

const isKeyPressed = {} as Record<string,any>

export const Shortcuts = {
    listenKeys(): void {
        document.onkeydown = (keyDownEvent) => {
            isKeyPressed[keyDownEvent.key] = true;
            this.checkShortcuts();
        }
        document.onkeyup = (keyUpEvent) => {
            isKeyPressed[keyUpEvent.key] = false;
        };
    },

    isPressed(keyCode: string): boolean {
        return isKeyPressed[keyCode] ? isKeyPressed[keyCode] : false;
    },

    checkShortcuts(): void {
        if(this.shortcutActive("Control","Alt","o")) {
            this.call("open-torrent");
        }
        if(this.shortcutActive("Control","Alt","a")) {
            this.call("add-server");
        }
        if(this.shortcutActive("Control","a")) {
            this.call("select-all");
        }
        if(this.shortcutActive("Control","Alt","c")) {
            this.call("clear-selection");
        }
        if(this.shortcutActive("Control","Alt","h")) {
            this.call("about");
        }
    },

    shortcutActive(...keys: string[]): boolean {
        for(const key of keys) {
            if(!this.isPressed(key)) {
                return false;
            }
        }
        for(const key of keys) {
            isKeyPressed[key] = false;
        }
        return true;
    },

    call(shortcut: string): void {
        Emitter.emit(shortcut);
    }
}