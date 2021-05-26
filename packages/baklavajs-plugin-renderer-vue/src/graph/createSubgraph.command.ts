import { Graph, GraphTemplate } from "@baklavajs/core";
import { Ref } from "vue";
import type { ICommandHandler } from "../commands";
import { switchGraph } from "./switchGraph";

export const CREATE_SUBGRAPH_COMMAND = "CREATE_SUBGRAPH";

export function registerCreateSubgraphCommand(displayedGraph: Ref<Graph>, handler: ICommandHandler) {
    handler.registerCommand(CREATE_SUBGRAPH_COMMAND, () => {
        const graph = displayedGraph.value;
        const editor = displayedGraph.value.editor;

        if (graph.selectedNodes.length === 0) {
            return;
        }

        const selectedNodes = graph.selectedNodes;

        const selectedNodesInputs = selectedNodes.flatMap((n) => Object.values(n.inputs));
        const selectedNodesOutputs = selectedNodes.flatMap((n) => Object.values(n.outputs));
        const inputInterfaces = graph.connections
            .filter((c) => !selectedNodesOutputs.includes(c.from) && selectedNodesInputs.includes(c.to))
            .map((c) => c.to);
        const outputInterfaces = graph.connections
            .filter((c) => selectedNodesOutputs.includes(c.from) && !selectedNodesInputs.includes(c.to))
            .map((c) => c.from);

        const innerConnections = graph.connections.filter(
            (c) => selectedNodesOutputs.includes(c.from) && selectedNodesInputs.includes(c.to)
        );

        const subgraphTemplate = new GraphTemplate(
            {
                connections: innerConnections.map((c) => ({ id: c.id, from: c.from.id, to: c.to.id })),
                inputs: inputInterfaces.map((i) => ({ nodeInterfaceId: i.id, name: i.name })),
                outputs: outputInterfaces.map((i) => ({ nodeInterfaceId: i.id, name: i.name })),
                nodes: selectedNodes.map((n) => n.save()),
            },
            editor
        );

        editor.graphTemplates.push(subgraphTemplate);

        // TODO: Delete the selected nodes and replace with the subgraph node

        switchGraph(displayedGraph, subgraphTemplate);
    });
}
