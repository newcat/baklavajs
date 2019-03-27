import { NodeInterface } from "./nodeInterface";
import generateId from "./idGenerator";
import { BaklavaEvent } from "./events";

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

export interface IConnection {
    id: string;
    from: NodeInterface;
    to: NodeInterface;
}

export class Connection {

    public id: string;
    public from: NodeInterface;
    public to: NodeInterface;
    public isInDanger = false;
    public destructed = false;

    public events = {
        destruct: new BaklavaEvent<void>()
    };

    public constructor(from: NodeInterface, to: NodeInterface) {

        if (!from || !to) {
            throw new Error("Cannot initialize connection with null/undefined for 'from' or 'to' values");
        }

        this.id = generateId();
        this.from = from;
        this.to = to;

        this.from.connectionCount++;
        this.to.connectionCount++;

    }

    public destruct() {
        this.events.destruct.emit();
        this.from.connectionCount--;
        this.to.connectionCount--;
        this.destructed = true;
    }

}

/**
 * This class is used for calculation purposes only.
 * It won't alter any state of the connected nodes
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
