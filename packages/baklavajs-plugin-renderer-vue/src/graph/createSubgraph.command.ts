import { createGraphNodeType, Graph, GraphTemplate, IGraphInterface, IGraphNode } from "@baklavajs/core";
import { v4 as uuidv4 } from "uuid";
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

        const inputConnections = graph.connections.filter(
            (c) => !selectedNodesOutputs.includes(c.from) && selectedNodesInputs.includes(c.to)
        );
        const outputConnections = graph.connections.filter(
            (c) => selectedNodesOutputs.includes(c.from) && !selectedNodesInputs.includes(c.to)
        );
        const innerConnections = graph.connections.filter(
            (c) => selectedNodesOutputs.includes(c.from) && selectedNodesInputs.includes(c.to)
        );

        const inputInterfaces = inputConnections.map((c) => c.to);
        const outputInterfaces = outputConnections.map((c) => c.from);

        const interfaceIdMap = new Map<string, string>();

        const graphInputs: IGraphInterface[] = [];
        for (const i of inputInterfaces) {
            const newId = uuidv4();
            interfaceIdMap.set(i.id, newId);
            graphInputs.push({ id: newId, nodeInterfaceId: i.id, name: i.name });
        }

        const graphOutputs: IGraphInterface[] = [];
        for (const i of outputInterfaces) {
            const newId = uuidv4();
            interfaceIdMap.set(i.id, newId);
            graphOutputs.push({ id: newId, nodeInterfaceId: i.id, name: i.name });
        }

        const subgraphTemplate = new GraphTemplate(
            {
                connections: innerConnections.map((c) => ({ id: c.id, from: c.from.id, to: c.to.id })),
                inputs: graphInputs,
                outputs: graphOutputs,
                nodes: selectedNodes.map((n) => n.save()),
            },
            editor
        );

        editor.graphTemplates.push(subgraphTemplate);

        const nt = createGraphNodeType(subgraphTemplate);
        editor.registerNodeType(nt);

        const node = new nt();
        graph.addNode(node);

        inputConnections.forEach((c) => {
            graph.removeConnection(c);
            graph.addConnection(c.from, node.inputs[interfaceIdMap.get(c.to.id)!]);
        });

        outputConnections.forEach((c) => {
            graph.removeConnection(c);
            graph.addConnection(node.outputs[interfaceIdMap.get(c.from.id)!], c.to);
        });

        selectedNodes.forEach((n) => graph.removeNode(n));

        switchGraph(displayedGraph, subgraphTemplate);
    });
}
