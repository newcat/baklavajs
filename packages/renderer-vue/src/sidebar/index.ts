import { Ref } from "vue";
import { Graph, NodeInterface } from "@baklavajs/core";
import { ICommandHandler } from "../commands";
import { registerOpenSidebarCommand } from "./openSidebar.command";

export { OPEN_SIDEBAR_COMMAND, OpenSidebarCommand } from "./openSidebar.command";

export const displayInSidebar = (intf: NodeInterface, displayInSidebar: boolean) => {
    intf.displayInSidebar = displayInSidebar;
};

export function registerSidebarCommands(displayedGraph: Ref<Graph>, handler: ICommandHandler) {
    registerOpenSidebarCommand(displayedGraph, handler);
}
