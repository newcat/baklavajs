import {
    NodeInstanceOf,
    NodeInterface,
    GRAPH_INPUT_NODE_TYPE,
    GRAPH_OUTPUT_NODE_TYPE,
    GraphInputNode,
    GraphOutputNode,
} from "@baklavajs/core";
import { TextInputInterface } from "../nodeinterfaces";

/** @deprecated use GRAPH_INPUT_NODE_TYPE from the @baklavajs/core package instead */
export const SUBGRAPH_INPUT_NODE_TYPE = GRAPH_INPUT_NODE_TYPE;
/** @deprecated use GRAPH_OUTPUT_NODE_TYPE from the @baklavajs/core package instead */
export const SUBGRAPH_OUTPUT_NODE_TYPE = GRAPH_OUTPUT_NODE_TYPE;

export class SubgraphInputNode extends GraphInputNode {
    protected override _title = "Subgraph Input";
    public override inputs = {
        name: new TextInputInterface("Name", "Input").setPort(false),
    };
    public override outputs = {
        placeholder: new NodeInterface("Connection", undefined),
    };
}

export class SubgraphOutputNode extends GraphOutputNode {
    protected override _title = "Subgraph Output";
    public override inputs = {
        name: new TextInputInterface("Name", "Output").setPort(false),
        placeholder: new NodeInterface("Connection", undefined),
    };
    public override outputs = {
        output: new NodeInterface("Output", undefined).setHidden(true),
    };
}

/** @deprecated */
export interface ISubgraphInterfaceNode {
    graphInterfaceId: string;
}
/** @deprecated */
export type InputNode = NodeInstanceOf<typeof SubgraphInputNode> & ISubgraphInterfaceNode;
/** @deprecated */
export type OutputNode = NodeInstanceOf<typeof SubgraphOutputNode> & ISubgraphInterfaceNode;
