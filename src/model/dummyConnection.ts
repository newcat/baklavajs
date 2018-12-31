import generateId from "../utility/idGenerator";
import { INodeInterfacePair, IConnection } from "./connection";

/**
 * This class is used for calculation purposes only.
 * It will not transfer values!
 * It will, however, also not alter any state of the connected nodes
 */
export class DummyConnection implements IConnection {

    public id: string;
    public from: INodeInterfacePair;
    public to: INodeInterfacePair;

    public constructor(from: INodeInterfacePair, to: INodeInterfacePair) {

        if (!from || !to) {
            throw new Error("Cannot initialize connection with null/undefined for 'from' or 'to' values");
        }

        this.id = generateId();
        this.from = from;
        this.to = to;

    }

}
