import { INodeIO } from './nodeIO';

export interface IState extends Record<string, any> {
    nodes: Array<INodeState<unknown, unknown>>;
    connections: IConnectionState[];
}

export type IODefinitionStates<D> = { [K in keyof D]: D[K] extends INodeIO<infer T> ? INodeIOState<T> : never }

export interface INodeState<I, O> {
    type: string;
    title: string;
    id: string;
    inputs: IODefinitionStates<I>;
    outputs: IODefinitionStates<O>;
}

export interface INodeIOState<T> extends Record<string, any> {
    id: string;
    value: T;
}

export interface IConnectionState extends Record<string, any> {
    id: string;
    from: string;
    to: string;
}
