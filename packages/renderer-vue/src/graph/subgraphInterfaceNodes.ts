import {
    NodeInstanceOf,
    NodeInterface,
    GRAPH_TEMPLATE_INPUT_NODE_TYPE,
    GRAPH_TEMPLATE_OUTPUT_NODE_TYPE,
    GraphTemplateInputNode,
    GraphTemplateOutputNode,
} from "@baklavajs/core";
import { TextInputInterface } from "../nodeinterfaces";

/** @deprecated use GRAPH_TEMPLATE_INPUT_NODE_TYPE from the @baklavajs/core package instead */
export const SUBGRAPH_INPUT_NODE_TYPE = GRAPH_TEMPLATE_INPUT_NODE_TYPE;
/** @deprecated use GRAPH_TEMPLATE_OUTPUT_NODE_TYPE from the @baklavajs/core package instead */
export const SUBGRAPH_OUTPUT_NODE_TYPE = GRAPH_TEMPLATE_OUTPUT_NODE_TYPE;

export class SubgraphInputNode extends GraphTemplateInputNode {
    protected override _title = "Subgraph Input";
    public inputs = {
        name: new TextInputInterface("Name", "Input").setPort(false),
    };
    public outputs = {
        placeholder: new NodeInterface("Connection", ""),
    };
}

export class SubgraphOutputNode extends GraphTemplateOutputNode {
    protected override _title = "Subgraph Output";
    public inputs = {
        name: new TextInputInterface("Name", "Output").setPort(false),
        placeholder: new NodeInterface("Connection", undefined),
    };
    public outputs = {
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
