import type { Ref } from "vue";
import type { Graph } from "@baklavajs/core";
import type { ICommandHandler } from "../commands";
import { registerCreateSubgraphCommand } from "./createSubgraph.command";
import { registerDeleteNodesCommand } from "./deleteNodes.command";
import { registerSaveSubgraphCommand } from "./saveSubgraph.command";
import type { SwitchGraph } from "./switchGraph";
import { registerSwitchToMainGraphCommand } from "./switchToMainGraph.command";

export function registerGraphCommands(displayedGraph: Ref<Graph>, handler: ICommandHandler, switchGraph: SwitchGraph) {
    registerDeleteNodesCommand(displayedGraph, handler);
    registerCreateSubgraphCommand(displayedGraph, handler, switchGraph);
    registerSaveSubgraphCommand(displayedGraph, handler);
    registerSwitchToMainGraphCommand(displayedGraph, handler, switchGraph);
}

export * from "./createSubgraph.command";
export * from "./deleteNodes.command";
export * from "./saveSubgraph.command";
export * from "./switchToMainGraph.command";

export * from "./subgraphInterfaceNodes";
export * from "./switchGraph";
