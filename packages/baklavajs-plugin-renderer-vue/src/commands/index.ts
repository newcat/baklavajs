import { Ref, ref } from "vue";
import { Graph } from "@baklavajs/core";
import { useHotkeyHandler } from "./hotkeyHandler";

export const DELETE_NODES_COMMAND = "DELETE_NODES";

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

export function registerCommonCommands(displayedGraph: Ref<Graph>, handler: ICommandHandler) {
    handler.registerCommand(DELETE_NODES_COMMAND, () => {
        displayedGraph.value.selectedNodes.forEach((n) => displayedGraph.value.removeNode(n));
    });
    handler.registerHotkey(["Delete"], DELETE_NODES_COMMAND);
}
