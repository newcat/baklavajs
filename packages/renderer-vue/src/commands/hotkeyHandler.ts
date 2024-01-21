import { ref } from "vue";
import { isInputElement } from "../utility";

export interface HotkeyRegistrationOptions {
    /**
     * Whether to prevent the default action of the hotkey.
     * @default false
     */
    preventDefault?: boolean;
    /**
     * Whether to stop the propagation of the hotkey.
     * @default false
     */
    stopPropagation?: boolean;
}

interface HotkeyHandler {
    keys: string[];
    commandName: string;
    options?: HotkeyRegistrationOptions;
}

export function useHotkeyHandler(executeCommand: (name: string) => void) {
    const pressedKeys = ref<string[]>([]);
    const handlers = ref<HotkeyHandler[]>([]);

    const handleKeyDown = (ev: KeyboardEvent) => {
        if (!pressedKeys.value.includes(ev.key)) {
            pressedKeys.value.push(ev.key);
        }

        if (document.activeElement && isInputElement(document.activeElement)) {
            return;
        }

        handlers.value.forEach((h) => {
            if (h.keys.every((k) => pressedKeys.value.includes(k))) {
                if (h.options?.preventDefault) {
                    ev.preventDefault();
                }
                if (h.options?.stopPropagation) {
                    ev.stopPropagation();
                }

                executeCommand(h.commandName);
            }
        });
    };

    const handleKeyUp = (ev: KeyboardEvent) => {
        const index = pressedKeys.value.indexOf(ev.key);
        if (index >= 0) {
            pressedKeys.value.splice(index, 1);
        }
    };

    const registerHotkey = (keys: string[], commandName: string, options?: HotkeyRegistrationOptions) => {
        handlers.value.push({ keys, commandName, options });
    };

    return { pressedKeys, handleKeyDown, handleKeyUp, registerHotkey };
}
