import { Ref, ref } from "vue";
import { ICommand } from "./command";
import { useHotkeyHandler } from "./hotkeyHandler";

export * from "./command";

export interface ICommandHandler {
    pressedKeys: Ref<string[]>;
    registerCommand<T extends ICommand>(name: string, command: T): void;
    executeCommand<T extends ICommand>(name: string, throwOnNonexisting?: false): ReturnType<T["execute"]> | void;
    executeCommand<T extends ICommand>(name: string, throwOnNonexisting: true): ReturnType<T["execute"]>;
    canExecuteCommand(name: string, throwOnNonexisting: boolean): boolean;
    registerHotkey(keys: string[], commandName: string): void;
    handleKeyUp(ev: KeyboardEvent): void;
    handleKeyDown(ev: KeyboardEvent): void;
}

export const useCommandHandler: () => ICommandHandler = () => {
    const commands = ref(new Map<string, ICommand>());

    const registerCommand = <T extends ICommand>(name: string, command: T): void => {
        if (commands.value.has(name)) {
            throw new Error(`Command "${name}" already exists`);
        }
        commands.value.set(name, command);
    };

    const executeCommand = <T extends ICommand>(
        name: string,
        throwOnNonexisting = false
    ): ReturnType<T["execute"]> | void => {
        if (!commands.value.has(name)) {
            if (throwOnNonexisting) {
                throw new Error(`[CommandHandler] Command ${name} not registered`);
            } else {
                return;
            }
        }
        return commands.value.get(name)!.execute();
    };

    const canExecuteCommand = (name: string, throwOnNonexisting = false): boolean => {
        if (!commands.value.has(name)) {
            if (throwOnNonexisting) {
                throw new Error(`[CommandHandler] Command ${name} not registered`);
            } else {
                return false;
            }
        }
        return commands.value.get(name)!.canExecute();
    };

    const hotkeyHandler = useHotkeyHandler(executeCommand);

    return { registerCommand, executeCommand, canExecuteCommand, ...hotkeyHandler };
};
