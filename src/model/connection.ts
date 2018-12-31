import { Node } from "./node";
import { NodeInterface } from "./nodeInterface";
import generateId from "../utility/idGenerator";

export interface INodeInterfacePair {
    node: Node;
    interface: NodeInterface;
}

export interface IConnection {
    id: string;
    from: INodeInterfacePair;
    to: INodeInterfacePair;
}

export class Connection implements IConnection {

    public id: string;
    public from: INodeInterfacePair;
    public to: INodeInterfacePair;
    public isInDanger = false;

    public constructor(from: INodeInterfacePair, to: INodeInterfacePair) {

        if (!from || !to) {
            throw new Error("Cannot initialize connection with null/undefined for 'from' or 'to' values");
        }

        this.id = generateId();
        this.from = from;
        this.to = to;

        this.from.interface.isConnected = true;
        this.to.interface.isConnected = true;

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
