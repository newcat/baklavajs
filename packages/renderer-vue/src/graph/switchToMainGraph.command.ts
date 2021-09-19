import { Graph } from "@baklavajs/core";
import { Ref } from "vue";
import type { ICommand, ICommandHandler } from "../commands";
import { SAVE_SUBGRAPH_COMMAND } from "./saveSubgraph.command";
import type { SwitchGraph } from "./switchGraph";

export const SWITCH_TO_MAIN_GRAPH_COMMAND = "SWITCH_TO_MAIN_GRAPH";
export type SwitchToMainGraphCommand = ICommand<void>;

export function registerSwitchToMainGraphCommand(
    displayedGraph: Ref<Graph>,
    handler: ICommandHandler,
    switchGraph: SwitchGraph
) {
    handler.registerCommand<SwitchToMainGraphCommand>(SWITCH_TO_MAIN_GRAPH_COMMAND, {
        canExecute: () => displayedGraph.value !== displayedGraph.value.editor.graph,
        execute: () => {
            handler.executeCommand(SAVE_SUBGRAPH_COMMAND);
            switchGraph(displayedGraph.value.editor.graph);
        },
    });
}
