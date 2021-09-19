import { Ref } from "vue";
import { Graph } from "@baklavajs/core";
import { ICommandHandler } from "../commands";
import { registerCreateSubgraphCommand } from "./createSubgraph.command";
import { registerDeleteNodesCommand } from "./deleteNodes.command";
import { registerSaveSubgraphCommand } from "./saveSubgraph.command";
import { SwitchGraph } from "./switchGraph";
import { registerSwitchToMainGraphCommand } from "./switchToMainGraph.command";

export function registerGraphCommands(displayedGraph: Ref<Graph>, handler: ICommandHandler, switchGraph: SwitchGraph) {
    registerDeleteNodesCommand(displayedGraph, handler);
    registerCreateSubgraphCommand(displayedGraph, handler, switchGraph);
    registerSaveSubgraphCommand(displayedGraph, handler);
    registerSwitchToMainGraphCommand(displayedGraph, handler, switchGraph);
}

export type { CreateSubgraphCommand } from "./createSubgraph.command";
export type { DeleteNodesCommand } from "./deleteNodes.command";
export type { SaveSubgraphCommand } from "./saveSubgraph.command";
export type { SwitchToMainGraphCommand } from "./switchToMainGraph.command";

export { CREATE_SUBGRAPH_COMMAND } from "./createSubgraph.command";
export { DELETE_NODES_COMMAND } from "./deleteNodes.command";
export { SAVE_SUBGRAPH_COMMAND } from "./saveSubgraph.command";
export { SWITCH_TO_MAIN_GRAPH_COMMAND } from "./switchToMainGraph.command";
