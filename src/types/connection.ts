import { INodeInterface } from "./nodeInterface";
import { INode } from "./node";

export interface INodeInterfacePair {
    node: INode;
    interface: INodeInterface;
}

export interface IConnection {
    id: string;
    from: INodeInterfacePair;
    to: INodeInterfacePair;
}
