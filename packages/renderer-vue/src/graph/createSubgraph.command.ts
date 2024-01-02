import {
    AbstractNode,
    Graph,
    GraphTemplate,
    getGraphNodeTypeString,
    GRAPH_INPUT_NODE_TYPE,
    GRAPH_OUTPUT_NODE_TYPE,
    INodeState,
    IConnectionState,
} from "@baklavajs/core";
import { v4 as uuidv4 } from "uuid";
import { reactive, Ref } from "vue";
import type { ICommand, ICommandHandler } from "../commands";
import { useViewModel } from "../utility";
import { IViewNodeState } from "../node/viewNode";
import { SaveSubgraphCommand, SAVE_SUBGRAPH_COMMAND } from "./saveSubgraph.command";
import type { SwitchGraph } from "./switchGraph";
import { SubgraphInputNode, SubgraphOutputNode } from "./subgraphInterfaceNodes";

export const CREATE_SUBGRAPH_COMMAND = "CREATE_SUBGRAPH";
export type CreateSubgraphCommand = ICommand<void>;

const IGNORE_NODE_TYPES = [GRAPH_INPUT_NODE_TYPE, GRAPH_OUTPUT_NODE_TYPE];

export function registerCreateSubgraphCommand(
    displayedGraph: Ref<Graph>,
    handler: ICommandHandler,
    switchGraph: SwitchGraph,
) {
    const canCreateSubgraph = () => {
        return displayedGraph.value.selectedNodes.filter((n) => !IGNORE_NODE_TYPES.includes(n.type)).length > 0;
    };

    const createSubgraph = () => {
        const { viewModel } = useViewModel();
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

        const nodeStates: Array<INodeState<unknown, unknown>> = selectedNodes.map((n) => n.save());
        const connectionStates: IConnectionState[] = innerConnections.map((c) => ({
            id: c.id,
            from: c.from.id,
            to: c.to.id,
        }));
        const interfaceIdMap = new Map<string, string>();
        const { xLeft, xRight, yTop } = getBoundingBoxForNodes(selectedNodes);
        console.log(xLeft, xRight, yTop);

        for (const [idx, conn] of inputConnections.entries()) {
            const inputNode = new SubgraphInputNode();
            inputNode.inputs.name.value = conn.to.name;
            nodeStates.push({
                ...inputNode.save(),
                position: { x: xRight - viewModel.value.settings.nodes.defaultWidth - 100, y: yTop + idx * 200 },
            } as Omit<IViewNodeState, "twoColumn" | "width">);
            connectionStates.push({ id: uuidv4(), from: inputNode.outputs.placeholder.id, to: conn.to.id });
            interfaceIdMap.set(conn.to.id, inputNode.graphInterfaceId);
        }
        for (const [idx, conn] of outputConnections.entries()) {
            const outputNode = new SubgraphOutputNode();
            outputNode.inputs.name.value = conn.from.name;
            nodeStates.push({
                ...outputNode.save(),
                position: { x: xLeft + 100, y: yTop + idx * 200 },
            } as Omit<IViewNodeState, "twoColumn" | "width">);
            connectionStates.push({ id: uuidv4(), from: conn.from.id, to: outputNode.inputs.placeholder.id });
            interfaceIdMap.set(conn.from.id, outputNode.graphInterfaceId);
        }

        const subgraphTemplate = reactive<GraphTemplate>(
            new GraphTemplate(
                {
                    connections: connectionStates,
                    nodes: nodeStates,
                    // ignored, but still providing to make TS happy
                    inputs: [],
                    outputs: [],
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

        // calculate the position for the graph node
        // it should appear in the middle of the nodes it replaces
        const averageX = Math.round(
            selectedNodes.map((n) => n.position.x).reduce((p, c) => p + c, 0) / selectedNodes.length,
        );
        const averageY = Math.round(
            selectedNodes.map((n) => n.position.y).reduce((p, c) => p + c, 0) / selectedNodes.length,
        );
        node.position.x = averageX;
        node.position.y = averageY;

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

function getBoundingBoxForNodes(nodes: AbstractNode[]) {
    const xRight = nodes.reduce((acc: number, cur: AbstractNode) => {
        const x = cur.position.x;
        return x < acc ? x : acc;
    }, Infinity);

    const yTop = nodes.reduce((acc: number, cur: AbstractNode) => {
        const y = cur.position.y;
        return y < acc ? y : acc;
    }, Infinity);

    const xLeft = nodes.reduce((acc: number, cur: AbstractNode) => {
        const x = cur.position.x + cur.width;
        return x > acc ? x : acc;
    }, -Infinity);

    return { xLeft, xRight, yTop };
}
