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
        this.from.interface.registerListener(this, this.transferValue);
        this.transferValue(this.from.interface.value);
    }

    public destruct() {
        this.from.interface.unregisterListener(this.transferValue);
    }

    private transferValue(v: any) {
        this.to.interface.value = v;
    }

}
