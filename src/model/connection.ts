import { NodeInterface } from "./nodeInterface";
import generateId from "./idGenerator";

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

export class Connection {

    public id: string;
    public from: NodeInterface;
    public to: NodeInterface;
    public isInDanger = false;
    public destructed = false;

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
        this.from.connectionCount--;
        this.to.connectionCount--;
        this.destructed = true;
    }

}
