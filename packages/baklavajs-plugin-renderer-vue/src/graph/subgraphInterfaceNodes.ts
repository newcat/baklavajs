import { v4 as uuidv4 } from "uuid";
import { defineNode, NodeInstanceOf, NodeInterface } from "@baklavajs/core";
import { TextInputInterface } from "../nodeinterfaces";

export const SUBGRAPH_INPUT_NODE_TYPE = "__baklava_SubgraphInputNode";
export const SUBGRAPH_OUTPUT_NODE_TYPE = "__baklava_SubgraphOutputNode";

export interface ISubgraphInterfaceNode {
    graphInterfaceId: string;
}

export const SubgraphInputNode = defineNode({
    type: SUBGRAPH_INPUT_NODE_TYPE,
    title: "Subgraph Input",
    inputs: {
        name: () => new TextInputInterface("Name", "Input").setPort(false),
    },
    outputs: {
        placeholder: () => new NodeInterface("Connection", undefined),
    },
    onCreate() {
        (this as unknown as ISubgraphInterfaceNode).graphInterfaceId = uuidv4();
    },
});

export const SubgraphOutputNode = defineNode({
    type: SUBGRAPH_OUTPUT_NODE_TYPE,
    title: "Subgraph Output",
    inputs: {
        name: () => new TextInputInterface("Name", "Output").setPort(false),
        placeholder: () => new NodeInterface("Connection", undefined),
    },
    onCreate() {
        (this as unknown as ISubgraphInterfaceNode).graphInterfaceId = uuidv4();
    },
});

export type InputNode = NodeInstanceOf<typeof SubgraphInputNode> & ISubgraphInterfaceNode;
export type OutputNode = NodeInstanceOf<typeof SubgraphOutputNode> & ISubgraphInterfaceNode;
