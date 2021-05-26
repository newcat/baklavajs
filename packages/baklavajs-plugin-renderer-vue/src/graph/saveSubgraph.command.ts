import { Ref } from "vue";
import { Connection, Graph, IGraphInterface, NodeInstanceOf } from "@baklavajs/core";
import type { ICommandHandler } from "../commands";
import {
    SUBGRAPH_INPUT_NODE_TYPE,
    SubgraphInputNode,
    SubgraphOutputNode,
    SUBGRAPH_OUTPUT_NODE_TYPE,
} from "./subgraphInterfaceNodes";

export const SAVE_SUBGRAPH_COMMAND = "SAVE_SUBGRAPH";

type InputNode = NodeInstanceOf<typeof SubgraphInputNode>;
type OutputNode = NodeInstanceOf<typeof SubgraphOutputNode>;

export function registerSaveSubgraphCommand(displayedGraph: Ref<Graph>, handler: ICommandHandler) {
    handler.registerCommand(SAVE_SUBGRAPH_COMMAND, () => {
        const graph = displayedGraph.value;

        if (!graph.template) {
            throw new Error("Graph template property not set");
        }

        const interfaceConnections: Connection[] = [];

        const inputs: IGraphInterface[] = [];
        const inputNodes = graph.nodes.filter((n) => n.type === SUBGRAPH_INPUT_NODE_TYPE) as InputNode[];
        for (const n of inputNodes) {
            const connections = graph.connections.filter((c) => c.from === n.outputs.placeholder);
            connections.forEach((c) => {
                inputs.push({
                    name: n.inputs.name.value,
                    nodeInterfaceId: c.to.id,
                });
            });
            interfaceConnections.push(...connections);
        }

        const outputs: IGraphInterface[] = [];
        const outputNodes = graph.nodes.filter((n) => n.type === SUBGRAPH_OUTPUT_NODE_TYPE) as OutputNode[];
        for (const n of outputNodes) {
            const connections = graph.connections.filter((c) => c.to === n.inputs.placeholder);
            connections.forEach((c) => {
                outputs.push({
                    name: n.inputs.name.value,
                    nodeInterfaceId: c.from.id,
                });
            });
            interfaceConnections.push(...connections);
        }

        const innerConnections = graph.connections.filter((c) => !interfaceConnections.includes(c));
        const nodes = graph.nodes.filter(
            (n) => n.type !== SUBGRAPH_INPUT_NODE_TYPE && n.type !== SUBGRAPH_OUTPUT_NODE_TYPE
        );

        graph.template.update({
            inputs,
            outputs,
            connections: innerConnections.map((c) => ({ id: c.id, from: c.from.id, to: c.to.id })),
            nodes,
        });
    });
}
