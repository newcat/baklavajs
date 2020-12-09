import { v4 as uuidv4 } from "uuid";
import { BaklavaEvent } from "@baklavajs/events";
import type { NodeInterface } from "./nodeInterface";

export interface IConnection {
    id: string;
    from: NodeInterface;
    to: NodeInterface;
}

export interface IConnectionState extends Record<string, any> {
    /** id of the connection */
    id: string;
    /** id of the source interface */
    from: string;
    /** id of the target interface */
    to: string;
}

export class Connection implements IConnection {
    public id: string;
    public from: NodeInterface;
    public to: NodeInterface;
    public isInDanger = false;
    public destructed = false;

    public events = {
        destruct: new BaklavaEvent<void>(),
    };

    public constructor(from: NodeInterface, to: NodeInterface) {
        if (!from || !to) {
            throw new Error("Cannot initialize connection with null/undefined for 'from' or 'to' values");
        }

        this.id = uuidv4();
        this.from = from;
        this.to = to;

        this.from.connectionCount++;
        this.to.connectionCount++;
    }

    public destruct(): void {
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
    public from: NodeInterface<unknown>;
    public to: NodeInterface<unknown>;

    public constructor(from: NodeInterface<unknown>, to: NodeInterface<unknown>) {
        if (!from || !to) {
            throw new Error("Cannot initialize connection with null/undefined for 'from' or 'to' values");
        }

        this.id = uuidv4();
        this.from = from;
        this.to = to;
    }
}
