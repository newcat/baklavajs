import { Ref } from "vue";
import { Connection, Graph, IGraphInterface } from "@baklavajs/core";
import type { ICommand, ICommandHandler } from "../commands";
import { SUBGRAPH_INPUT_NODE_TYPE, SUBGRAPH_OUTPUT_NODE_TYPE, InputNode, OutputNode } from "./subgraphInterfaceNodes";

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
        const inputNodes = graph.nodes.filter((n) => n.type === SUBGRAPH_INPUT_NODE_TYPE) as InputNode[];
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
        const outputNodes = graph.nodes.filter((n) => n.type === SUBGRAPH_OUTPUT_NODE_TYPE) as OutputNode[];
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
        const nodes = graph.nodes.filter(
            (n) => n.type !== SUBGRAPH_INPUT_NODE_TYPE && n.type !== SUBGRAPH_OUTPUT_NODE_TYPE
        );

        const nt = displayedGraph.value.editor.nodeTypes.get(`__baklava_GraphNode-${graph.template.id}`);
        if (nt) {
            nt.title = graph.template.name;
        }

        graph.template.update({
            inputs,
            outputs,
            connections: innerConnections.map((c) => ({ id: c.id, from: c.from.id, to: c.to.id })),
            nodes,
        });
    };

    handler.registerCommand(SAVE_SUBGRAPH_COMMAND, {
        canExecute: () => displayedGraph.value !== displayedGraph.value.editor?.graph,
        execute: saveSubgraph,
    });
}
