const isKeyPressed = {} as Record<string,any>

export const Shortcuts = {
    listenKeys(): void {
        document.onkeydown = (keyDownEvent) => {
            isKeyPressed[keyDownEvent.key] = true;  
        }
        document.onkeyup = (keyUpEvent) => {
            isKeyPressed[keyUpEvent.key] = false;
        };
    },

    isPressed(keyCode: string): boolean {
        return isKeyPressed[keyCode] ? isKeyPressed[keyCode] : false;
    }
}