import { AbstractNode, defineNode, GraphTemplate, Node, NodeInterface } from "@baklavajs/core";
import { TextInputInterface } from "../nodeinterfaces";

// https://github.com/microsoft/TypeScript/issues/30355
/*type PublicConstructor<T> = new () => { [K in keyof T]: T[K] };
type InputNode<T> = Node<{ input: T }, {}>;
type OutputNode<T> = Node<{}, { output: T }>;

export function createSubgraphInputNode<T extends NodeInterface<V>, V>(
    template: GraphTemplate,
    nodeInterface: T
): PublicConstructor<InputNode<V>> {
    return class extends Node<{ input: V }, {}> {
        inputs = { input: nodeInterface };
        outputs = {};
    }
}

export function createSubgraphOutputNode<T extends NodeInterface<V>, V>(
    template: GraphTemplate,
    nodeInterface: T,
    type: "output"
): PublicConstructor<OutputNode<V>> {}*/

export const SUBGRAPH_INPUT_NODE_TYPE = "__baklavaSubgraphInputNode";
export const SUBGRAPH_OUTPUT_NODE_TYPE = "__baklavaSubgraphOutputNode";

export const SubgraphInputNode = defineNode({
    type: SUBGRAPH_INPUT_NODE_TYPE,
    title: "Subgraph Input",
    inputs: {
        name: () => new TextInputInterface("Name", "Input").setPort(false),
    },
    outputs: {
        placeholder: () => new NodeInterface("Connection", undefined),
    },
});

export const SubgraphOutputNode = defineNode({
    type: SUBGRAPH_OUTPUT_NODE_TYPE,
    title: "Subgraph Output",
    inputs: {
        name: () => new TextInputInterface("Name", "Input").setPort(false),
        placeholder: () => new NodeInterface("Connection", undefined),
    },
});
