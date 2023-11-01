import { Ref } from "vue";
import { Connection, Graph, IGraphInterface } from "@baklavajs/core";
import type { ICommand, ICommandHandler } from "../commands";
import {
    SUBGRAPH_INPUT_NODE_TYPE,
    SUBGRAPH_OUTPUT_NODE_TYPE,
    SubgraphOutputNode, SubgraphInputNode
} from "./subgraphInterfaceNodes";

export const SAVE_SUBGRAPH_COMMAND = "SAVE_SUBGRAPH";
export type SaveSubgraphCommand = ICommand<void>;

export function registerSaveSubgraphCommand(displayedGraph: Ref<Graph>, handler: ICommandHandler) {
    const saveSubgraph = () => {
        const graph = displayedGraph.value;

        if (!graph.template) {
            throw new Error("Graph template property not set");
        }

        const interfaceConnections: Connection[] = [];

        const inputs: IGraphInterface[] = [];
        const inputNodes = graph.nodes.filter((n) => n.type === SUBGRAPH_INPUT_NODE_TYPE) as unknown as SubgraphInputNode[];
        for (const n of inputNodes) {
            const connections = graph.connections.filter((c) => c.from === n.outputs.placeholder);
            connections.forEach((c) => {
                inputs.push({
                    id: n.graphInterfaceId,
                    name: n.inputs.name.value,
                    nodeInterfaceId: c.to.id,
                });
            });
            interfaceConnections.push(...connections);
        }

        const outputs: IGraphInterface[] = [];
        const outputNodes = graph.nodes.filter((n) => n.type === SUBGRAPH_OUTPUT_NODE_TYPE) as unknown as SubgraphOutputNode[];
        for (const n of outputNodes) {
            const connections = graph.connections.filter((c) => c.to === n.inputs.placeholder);
            connections.forEach((c) => {
                outputs.push({
                    id: n.graphInterfaceId,
                    name: n.inputs.name.value,
                    nodeInterfaceId: c.from.id,
                });
            });
            interfaceConnections.push(...connections);
        }

        const innerConnections = graph.connections.filter((c) => !interfaceConnections.includes(c));

        graph.template.update({
            inputs,
            outputs,
            connections: innerConnections.map((c) => ({ id: c.id, from: c.from.id, to: c.to.id })),
            nodes: graph.nodes.map((n) => n.save()),
            // will be ignored in the update method but still providing them to make TypeScript happy
            panning: graph.panning,
            scaling: graph.scaling,
        });

        graph.template.panning = graph.panning;
        graph.template.scaling = graph.scaling;
    };

    handler.registerCommand(SAVE_SUBGRAPH_COMMAND, {
        canExecute: () => displayedGraph.value !== displayedGraph.value.editor?.graph,
        execute: saveSubgraph,
    });
}
