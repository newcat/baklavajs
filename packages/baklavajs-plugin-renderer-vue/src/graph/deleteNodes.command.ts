import { Ref } from "vue";
import { Graph } from "@baklavajs/core";
import type { ICommandHandler } from "../commands";

export const DELETE_NODES_COMMAND = "DELETE_NODES";

export function registerDeleteNodesCommand(displayedGraph: Ref<Graph>, handler: ICommandHandler) {
    handler.registerCommand(DELETE_NODES_COMMAND, () => {
        displayedGraph.value.selectedNodes.forEach((n) => displayedGraph.value.removeNode(n));
    });
    handler.registerHotkey(["Delete"], DELETE_NODES_COMMAND);
}
