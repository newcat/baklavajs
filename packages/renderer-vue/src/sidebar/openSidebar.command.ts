import { Ref } from "vue";
import { Graph } from "@baklavajs/core";
import type { ICommand, ICommandHandler } from "../commands";

export type OpenSidebarCommand = ICommand<void, [nodeId: string]>;
export const OPEN_SIDEBAR_COMMAND = "OPEN_SIDEBAR";

export function registerOpenSidebarCommand(displayedGraph: Ref<Graph>, handler: ICommandHandler) {
    handler.registerCommand<OpenSidebarCommand>(OPEN_SIDEBAR_COMMAND, {
        execute: (nodeId: string) => {
            displayedGraph.value.sidebar.nodeId = nodeId;
            displayedGraph.value.sidebar.visible = true;
        },
        canExecute: () => true,
    });
}
