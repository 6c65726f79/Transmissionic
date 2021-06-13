import { Emitter } from "./Emitter";

let isKeyPressed = {"ctrl":false,"alt":false} as Record<string,any>

export const Shortcuts = {
    listenKeys(): void {
        document.onkeydown = (keyDownEvent) => { this.keyEventHandler(keyDownEvent, true) };
        document.onkeyup = (keyUpEvent) => { this.keyEventHandler(keyUpEvent, false) };
    },

    keyEventHandler(event: KeyboardEvent, pressed: boolean): void {
        if(!pressed){
            isKeyPressed = {"ctrl":false,"alt":false};
        }
        if(event.key!="Control" && event.key!="Alt"){
            isKeyPressed["ctrl"] = event.ctrlKey;
            isKeyPressed["alt"] = event.altKey;
            isKeyPressed[event.key] = pressed;
            if(pressed){
                this.checkShortcuts();
            }
        }
    },

    isPressed(keyCode: string): boolean {
        return isKeyPressed[keyCode] ? isKeyPressed[keyCode] : false;
    },

    getPressedKeys(): Array<string> {
        const pressed = [];

        for(const key in isKeyPressed){
            if(this.isPressed(key)){
                pressed.push(key);
            }
        }

        return pressed;
    },

    checkShortcuts(): void {
        const keys = this.getPressedKeys();

        switch (keys.toString()) {
            case "Enter":
            case "Shift,Enter":
                this.simulateClick();
                break;
            case "alt,t":
                this.call("add-torrent");
                break;
            case "alt,m":
                this.call("add-magnet");
                break;
            case "alt,n":
                this.call("add-server");
                break;
            case "alt,s":
                this.call("settings");
                break;
            case "ctrl,a":
                this.call("select-all");
                break;
            case "ctrl,alt,c":
                this.call("clear-selection");
                break;
            case "alt,h":
                this.call("about");
                break;
            case "ctrl,alt,s":
                this.call("toggle-search");
                break;
            case "alt,i":
                this.call("info-server");
                break;
            case "alt,c":
                this.call("config-server");
                break;
            case "ctrl,ArrowRight":
                this.call("next-tab");
                break;
            case "ctrl,ArrowLeft":
                this.call("previous-tab");
                break;
            default:
                break;
        }
    },

    simulateClick(): void {
        const active = document.activeElement as HTMLElement;
        active.blur();
        active.click();
    },

    call(shortcut: string): void {
        Emitter.emit(shortcut);
    }
}