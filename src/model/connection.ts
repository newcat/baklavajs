import Node from "./node";
import NodeInterface from "./nodeInterface";
import generateId from "@/utility/idGenerator";

export interface INodeInterfacePair {
    node: Node;
    interface: NodeInterface;
}

export default class Connection {

    public id: string;
    public from: INodeInterfacePair;
    public to: INodeInterfacePair;

    public constructor(from: INodeInterfacePair, to: INodeInterfacePair) {
        this.id = generateId();
        this.from = from;
        this.to = to;
    }

}
