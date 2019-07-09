import { INodeInterface } from "./nodeInterface";

export enum TemporaryConnectionState {
    NONE,
    ALLOWED,
    FORBIDDEN
}

export interface ITemporaryConnection {
    status: TemporaryConnectionState;
    from: INodeInterface;
    to?: INodeInterface;
    mx?: number;
    my?: number;
}

export interface IConnection {
    id: string;
    from: INodeInterface;
    to: INodeInterface;
}

export interface ITransferConnection extends IConnection {
    isInDanger: boolean;
    destructed: boolean;
}
