import { NodeInterface } from "@baklavajs/core";
import { ICommand } from "../commands";

export type OpenSidebarCommand = ICommand<void, [nodeId: string]>;
export const OPEN_SIDEBAR_COMMAND = "OPEN_SIDEBAR";

export const displayInSidebar = (intf: NodeInterface, displayInSidebar: boolean) => {
    intf.displayInSidebar = displayInSidebar;
};
