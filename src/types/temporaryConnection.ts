import { INodeInterfacePair } from "./connection";

export enum TemporaryConnectionState {
    NONE,
    ALLOWED,
    FORBIDDEN
}

export interface ITemporaryConnection {
    status: TemporaryConnectionState;
    from: INodeInterfacePair;
    to?: INodeInterfacePair;
    mx?: number;
    my?: number;
}
