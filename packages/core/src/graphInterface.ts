import { v4 as uuidv4 } from "uuid";
import { Node, INodeState, CalculateFunction, AbstractNode } from "./node";
import { NodeInterface } from "./nodeInterface";

export interface IGraphInterface {
    id: string;
    nodeId: string;
    nodeInterfaceId: string;
    name: string;
}

export const GRAPH_INPUT_NODE_TYPE = "__baklava_SubgraphInputNode";
export const GRAPH_OUTPUT_NODE_TYPE = "__baklava_SubgraphOutputNode";

interface IGraphInterfaceNodeState<I, O> extends INodeState<I, O> {
    graphInterfaceId: string;
}

abstract class GraphInterfaceNode<I, O> extends Node<I, O> {
    public graphInterfaceId: string;

    constructor() {
        super();
        this.graphInterfaceId = uuidv4();
    }

    onPlaced() {
        super.onPlaced();
        this.initializeIo();
    }

    save(): IGraphInterfaceNodeState<I, O> {
        return {
            ...super.save(),
            graphInterfaceId: this.graphInterfaceId,
        };
    }

    load(state: IGraphInterfaceNodeState<I, O>) {
        super.load(state as INodeState<I, O>);
        this.graphInterfaceId = state.graphInterfaceId;
    }
}

export class GraphInputNode extends GraphInterfaceNode<{ name: string }, { placeholder: any }> {
    public static isGraphInputNode(v: AbstractNode): v is GraphInputNode {
        return v.type === GRAPH_INPUT_NODE_TYPE;
    }

    public override readonly type = GRAPH_INPUT_NODE_TYPE;
    public inputs = {
        name: new NodeInterface("Name", "Input"),
    };
    public outputs = {
        placeholder: new NodeInterface("Value", undefined),
    };
}
export type GraphInputNodeState = IGraphInterfaceNodeState<{ name: string }, { placeholder: any }>;

export class GraphOutputNode extends GraphInterfaceNode<{ name: string; placeholder: any }, { output: any }> {
    public static isGraphOutputNode(v: AbstractNode): v is GraphOutputNode {
        return v.type === GRAPH_OUTPUT_NODE_TYPE;
    }

    public override readonly type = GRAPH_OUTPUT_NODE_TYPE;
    public inputs = {
        name: new NodeInterface("Name", "Output"),
        placeholder: new NodeInterface("Value", undefined),
    };
    public outputs = {
        output: new NodeInterface("Output", undefined).setHidden(true),
    };
    public override calculate: CalculateFunction<{ placeholder: any }, { output: any }> = ({ placeholder }) => ({
        output: placeholder,
    });
}
export type GraphOutputNodeState = IGraphInterfaceNodeState<{ name: string; placeholder: any }, { output: any }>;
