import { Ref } from "vue";
import { Graph } from "@baklavajs/core";
import type { ICommand, ICommandHandler } from "../commands";

export const DELETE_NODES_COMMAND = "DELETE_NODES";
export type DeleteNodesCommand = ICommand<void>;

export function registerDeleteNodesCommand(displayedGraph: Ref<Graph>, handler: ICommandHandler) {
    handler.registerCommand(DELETE_NODES_COMMAND, {
        canExecute: () => displayedGraph.value.selectedNodes.length > 0,
        execute() {
            displayedGraph.value.selectedNodes.forEach((n) => displayedGraph.value.removeNode(n));
        },
    });
    handler.registerHotkey(["Delete"], DELETE_NODES_COMMAND);
}
