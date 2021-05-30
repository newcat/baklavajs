import { Ref } from "vue";
import { Graph } from "@baklavajs/core";
import { ICommandHandler } from "../commands";
import { registerCreateSubgraphCommand } from "./createSubgraph.command";
import { registerDeleteNodesCommand } from "./deleteNodes.command";
import { registerSaveSubgraphCommand } from "./saveSubgraph.command";
import { SwitchGraph } from "./switchGraph";

export function registerGraphCommands(displayedGraph: Ref<Graph>, handler: ICommandHandler, switchGraph: SwitchGraph) {
    registerDeleteNodesCommand(displayedGraph, handler);
    registerCreateSubgraphCommand(displayedGraph, handler, switchGraph);
    registerSaveSubgraphCommand(displayedGraph, handler);
}
