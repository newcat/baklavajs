import { ViewPlugin } from "../viewPlugin";

export const DELETE_NODES_COMMAND = "DELETE_NODES";

export function registerCommonCommands(plugin: ViewPlugin) {
    plugin.registerCommand(DELETE_NODES_COMMAND, () => {
        plugin.selectedNodes.forEach((n) => plugin.displayedGraph.removeNode(n));
    });
    plugin.hotkeyHandler.registerCommand(["Delete"], DELETE_NODES_COMMAND);
}

export * from "./hotkeyHandler";
