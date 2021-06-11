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

        console.log(keys);

        switch (keys.toString()) {
            case "ctrl,alt,o":
                this.call("open-torrent");
                break;
            case "ctrl,alt,a":
                this.call("add-server");
                break;
            case "ctrl,a":
                this.call("select-all");
                break;
            case "ctrl,alt,c":
                this.call("clear-selection");
                break;
            case "ctrl,alt,h":
                this.call("about");
                break;
            case "ctrl,alt,s":
                this.call("toggle-search");
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

    call(shortcut: string): void {
        Emitter.emit(shortcut);
    }
}