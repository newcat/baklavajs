import { AbstractNode, Graph, GraphTemplate, IGraphInterface, getGraphNodeTypeString } from "@baklavajs/core";
import { v4 as uuidv4 } from "uuid";
import { reactive, Ref } from "vue";
import type { ICommand, ICommandHandler } from "../commands";
import { SaveSubgraphCommand, SAVE_SUBGRAPH_COMMAND } from "./saveSubgraph.command";
import { SUBGRAPH_INPUT_NODE_TYPE, SUBGRAPH_OUTPUT_NODE_TYPE } from "./subgraphInterfaceNodes";
import type { SwitchGraph } from "./switchGraph";

export const CREATE_SUBGRAPH_COMMAND = "CREATE_SUBGRAPH";
export type CreateSubgraphCommand = ICommand<void>;

const IGNORE_NODE_TYPES = [SUBGRAPH_INPUT_NODE_TYPE, SUBGRAPH_OUTPUT_NODE_TYPE];

export function registerCreateSubgraphCommand(
    displayedGraph: Ref<Graph>,
    handler: ICommandHandler,
    switchGraph: SwitchGraph,
) {
    const canCreateSubgraph = () => {
        return displayedGraph.value.selectedNodes.filter((n) => !IGNORE_NODE_TYPES.includes(n.type)).length > 0;
    };

    const createSubgraph = () => {
        const graph = displayedGraph.value;
        const editor = displayedGraph.value.editor;

        if (graph.selectedNodes.length === 0) {
            return;
        }

        const selectedNodes = graph.selectedNodes.filter((n) => !IGNORE_NODE_TYPES.includes(n.type));

        const selectedNodesInputs = selectedNodes.flatMap((n) => Object.values(n.inputs));
        const selectedNodesOutputs = selectedNodes.flatMap((n) => Object.values(n.outputs));

        const inputConnections = graph.connections.filter(
            (c) => !selectedNodesOutputs.includes(c.from) && selectedNodesInputs.includes(c.to),
        );
        const outputConnections = graph.connections.filter(
            (c) => selectedNodesOutputs.includes(c.from) && !selectedNodesInputs.includes(c.to),
        );
        const innerConnections = graph.connections.filter(
            (c) => selectedNodesOutputs.includes(c.from) && selectedNodesInputs.includes(c.to),
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

        const subgraphTemplate = reactive<GraphTemplate>(
            new GraphTemplate(
                {
                    connections: innerConnections.map((c) => ({ id: c.id, from: c.from.id, to: c.to.id })),
                    inputs: graphInputs,
                    outputs: graphOutputs,
                    nodes: selectedNodes.map((n) => n.save()),
                },
                editor,
            ),
        ) as GraphTemplate;

        editor.addGraphTemplate(subgraphTemplate);
        const nt = editor.nodeTypes.get(getGraphNodeTypeString(subgraphTemplate));
        if (!nt) {
            throw new Error("Unable to create subgraph: Could not find corresponding graph node type");
        }

        const node = reactive<AbstractNode>(new nt.type()) as AbstractNode;
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

        if (handler.canExecuteCommand(SAVE_SUBGRAPH_COMMAND)) {
            handler.executeCommand<SaveSubgraphCommand>(SAVE_SUBGRAPH_COMMAND);
        }

        switchGraph(subgraphTemplate);

        displayedGraph.value.panning = { ...graph.panning };
        displayedGraph.value.scaling = graph.scaling;
    };

    handler.registerCommand<CreateSubgraphCommand>(CREATE_SUBGRAPH_COMMAND, {
        canExecute: canCreateSubgraph,
        execute: createSubgraph,
    });
}
