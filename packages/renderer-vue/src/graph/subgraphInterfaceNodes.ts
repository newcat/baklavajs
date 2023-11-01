import { v4 as uuidv4 } from "uuid";
import { INodeState, NodeInstanceOf, NodeInterface, Node } from "@baklavajs/core";
import { TextInputInterface } from "../nodeinterfaces";

export const SUBGRAPH_INPUT_NODE_TYPE = "__baklava_SubgraphInputNode";
export const SUBGRAPH_OUTPUT_NODE_TYPE = "__baklava_SubgraphOutputNode";

export interface ISubgraphInterfaceState<I, O> extends INodeState<I, O> {
    graphInterfaceId: string;
}

abstract class SubgraphInterfaceNode<I, O> extends Node<I, O> implements ISubgraphInterfaceNode {
    public graphInterfaceId: string;

    constructor() {
        super();
        this.graphInterfaceId = uuidv4();
    }

    onPlaced() {
        super.onPlaced();

        this.initializeIo();
    }

    save(): ISubgraphInterfaceState<I, O> {
        return {
            ...super.save(),
            graphInterfaceId: this.graphInterfaceId,
        };
    }

    load(state: ISubgraphInterfaceState<I, O>) {
        super.load(state as INodeState<I, O>);
        this.graphInterfaceId = state.graphInterfaceId;
    }
}

export interface ISubgraphInterfaceNode {
    graphInterfaceId: string;
}

interface SubgraphInputNodeInputs {
    name: string;
}

interface SubgraphInputNodeOutputs {
    placeholder: string;
}

export class SubgraphInputNode extends SubgraphInterfaceNode<SubgraphInputNodeInputs, SubgraphInputNodeOutputs> implements ISubgraphInterfaceNode{
    public readonly type = SUBGRAPH_INPUT_NODE_TYPE;
    _title = "Subgraph Input";
    public inputs = {
        name: new TextInputInterface("Name", "Input").setPort(false),
    };
    public outputs = {
        placeholder: new NodeInterface("Connection", ''),
    };
}

interface SubgraphOutputNodeInputs {
    name: string;
    placeholder: string;
}

interface SubgraphOutputNodeOutputs {}

export class SubgraphOutputNode extends SubgraphInterfaceNode<SubgraphOutputNodeInputs, SubgraphOutputNodeOutputs> implements ISubgraphInterfaceNode{
    public readonly type = SUBGRAPH_OUTPUT_NODE_TYPE;
    _title = "Subgraph Output";
    public inputs = {
        name: new TextInputInterface("Name", "Output").setPort(false),
        placeholder: new NodeInterface("Connection", ''),
    };
    public outputs = {};
}

export type InputNode = NodeInstanceOf<typeof SubgraphInputNode> & ISubgraphInterfaceNode;
export type OutputNode = NodeInstanceOf<typeof SubgraphOutputNode> & ISubgraphInterfaceNode;
