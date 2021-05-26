import { Ref, ref } from "vue";
import { useHotkeyHandler } from "./hotkeyHandler";

export interface ICommandHandler {
    pressedKeys: Ref<string[]>;
    registerCommand(name: string, executionFn: () => any): void;
    executeCommand(name: string): boolean;
    registerHotkey(keys: string[], commandName: string): void;
    handleKeyUp(ev: KeyboardEvent): void;
    handleKeyDown(ev: KeyboardEvent): void;
}

export const useCommandHandler: () => ICommandHandler = () => {
    const commands = ref(new Map<string, () => any>());

    const registerCommand = (name: string, executionFn: () => any): void => {
        if (commands.value.has(name)) {
            throw new Error(`Command "${name}" already exists`);
        }
        commands.value.set(name, executionFn);
    };

    const executeCommand = (name: string): boolean => {
        if (!commands.value.has(name)) {
            return false;
        }
        commands.value.get(name)!();
        return true;
    };

    const hotkeyHandler = useHotkeyHandler(executeCommand);

    return { registerCommand, executeCommand, ...hotkeyHandler };
};
