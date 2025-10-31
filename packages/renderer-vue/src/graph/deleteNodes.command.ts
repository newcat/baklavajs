import type { Ref } from "vue";
import type { Graph } from "@baklavajs/core";
import type { ICommand, ICommandHandler } from "../commands";
import { COMMIT_TRANSACTION_COMMAND, START_TRANSACTION_COMMAND } from "../history";

export const DELETE_NODES_COMMAND = "DELETE_NODES";
export type DeleteNodesCommand = ICommand<void>;

export function registerDeleteNodesCommand(displayedGraph: Ref<Graph>, handler: ICommandHandler) {
    handler.registerCommand(DELETE_NODES_COMMAND, {
        canExecute: () => displayedGraph.value.selectedNodes.length > 0,
        execute() {
            handler.executeCommand(START_TRANSACTION_COMMAND);
            for (let i = displayedGraph.value.selectedNodes.length - 1; i >= 0; i--) {
                const n = displayedGraph.value.selectedNodes[i];
                displayedGraph.value.removeNode(n);
            }
            handler.executeCommand(COMMIT_TRANSACTION_COMMAND);
        },
    });
    handler.registerHotkey(["Delete"], DELETE_NODES_COMMAND);
}
