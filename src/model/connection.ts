import { NodeInterface } from "./nodeInterface";
import generateId from "../utility/idGenerator";
import { NodeInterfaceTypeManager } from "./nodeInterfaceTypeManager";

export interface IConnection {
    id: string;
    from: NodeInterface;
    to: NodeInterface;
}

export enum TemporaryConnectionState {
    NONE,
    ALLOWED,
    FORBIDDEN
}

export interface ITemporaryConnection {
    status: TemporaryConnectionState;
    from: NodeInterface;
    to?: NodeInterface;
    mx?: number;
    my?: number;
}

export class Connection implements IConnection {

    public id: string;
    public from: NodeInterface;
    public to: NodeInterface;
    public isInDanger = false;

    private nodeInterfaceTypes: NodeInterfaceTypeManager;

    public constructor(from: NodeInterface, to: NodeInterface, tm: NodeInterfaceTypeManager) {

        if (!from || !to) {
            throw new Error("Cannot initialize connection with null/undefined for 'from' or 'to' values");
        }

        this.id = generateId();
        this.from = from;
        this.to = to;
        this.nodeInterfaceTypes = tm;

        this.from.connectionCount++;
        this.to.connectionCount++;

        this.from.registerListener(this, this.transferValue);
        this.transferValue(this.from.value);

    }

    public destruct() {
        this.from.connectionCount--;
        this.to.connectionCount--;
        this.from.unregisterListener(this.transferValue);
    }

    private transferValue(v: any) {
        this.to.value = this.nodeInterfaceTypes.convert(this.from.type, this.to.type, v);
    }

}

/**
 * This class is used for calculation purposes only.
 * It will not transfer values!
 * It will, however, also not alter any state of the connected nodes
 */
export class DummyConnection implements IConnection {

    public id: string;
    public from: NodeInterface;
    public to: NodeInterface;

    public constructor(from: NodeInterface, to: NodeInterface) {

        if (!from || !to) {
            throw new Error("Cannot initialize connection with null/undefined for 'from' or 'to' values");
        }

        this.id = generateId();
        this.from = from;
        this.to = to;

    }

}
