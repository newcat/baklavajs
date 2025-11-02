import type { Ref } from "vue";
import type { Graph } from "@baklavajs/core";
import type { ICommand, ICommandHandler } from "../commands";

export const SAVE_SUBGRAPH_COMMAND = "SAVE_SUBGRAPH";
export type SaveSubgraphCommand = ICommand<void>;

export function registerSaveSubgraphCommand(displayedGraph: Ref<Graph>, handler: ICommandHandler) {
    const saveSubgraph = () => {
        const graph = displayedGraph.value;
        if (!graph.template) {
            throw new Error("Graph template property not set");
        }
        graph.template.update(graph.save());
        graph.template.panning = graph.panning;
        graph.template.scaling = graph.scaling;
    };

    handler.registerCommand(SAVE_SUBGRAPH_COMMAND, {
        canExecute: () => displayedGraph.value !== displayedGraph.value.editor?.graph,
        execute: saveSubgraph,
    });
}
