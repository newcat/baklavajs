import { AbstractNode, createGraphNodeType, Graph, GraphTemplate, IGraphInterface } from "@baklavajs/core";
import { v4 as uuidv4 } from "uuid";
import { reactive, Ref } from "vue";
import type { ICommand, ICommandHandler } from "../commands";
import type { SwitchGraph } from "./switchGraph";

export const CREATE_SUBGRAPH_COMMAND = "CREATE_SUBGRAPH";
export type CreateSubgraphCommand = ICommand<void>;

export function registerCreateSubgraphCommand(
    displayedGraph: Ref<Graph>,
    handler: ICommandHandler,
    switchGraph: SwitchGraph
) {
    const canCreateSubgraph = () => {
        return displayedGraph.value.selectedNodes.length > 0;
    };

    const createSubgraph = () => {
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
        editor.registerNodeType(nt, { category: "Subgraphs" });

        const node = reactive<AbstractNode>(new nt()) as AbstractNode;
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

        switchGraph(subgraphTemplate);

        displayedGraph.value.panning = { ...graph.panning };
        displayedGraph.value.scaling = graph.scaling;
    };

    handler.registerCommand<CreateSubgraphCommand>(CREATE_SUBGRAPH_COMMAND, {
        canExecute: canCreateSubgraph,
        execute: createSubgraph,
    });
}
