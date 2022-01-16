import { Ref } from "vue";
import { Graph, NodeInterface } from "@baklavajs/core";
import type { ICommandHandler } from "../commands";
import type { OpenSidebarCommand } from "./openSidebar.command";
import { OPEN_SIDEBAR_COMMAND, registerOpenSidebarCommand } from "./openSidebar.command";

export const displayInSidebar = (intf: NodeInterface, displayInSidebar: boolean) => {
    intf.displayInSidebar = displayInSidebar;
};

export function registerSidebarCommands(displayedGraph: Ref<Graph>, handler: ICommandHandler) {
    registerOpenSidebarCommand(displayedGraph, handler);
}

export { OPEN_SIDEBAR_COMMAND, OpenSidebarCommand };
