import type { ViewPlugin } from "../viewPlugin";

export class HotkeyHandler {
    public pressedKeys: string[] = [];
    private handlers: Array<{ keys: string[]; commandName: string }> = [];

    public constructor(private readonly plugin: ViewPlugin) {}

    public onKeyDown(ev: KeyboardEvent) {
        if (!this.pressedKeys.includes(ev.key)) {
            this.pressedKeys.push(ev.key);
        }

        this.handlers.forEach((h) => {
            if (h.keys.every((k) => this.pressedKeys.includes(k))) {
                this.plugin.executeCommand(h.commandName);
            }
        });
    }

    public onKeyUp(ev: KeyboardEvent) {
        const index = this.pressedKeys.indexOf(ev.key);
        if (index >= 0) {
            this.pressedKeys.splice(index, 1);
        }
    }

    public registerCommand(keys: string[], commandName: string) {
        this.handlers.push({ keys, commandName });
    }
}
