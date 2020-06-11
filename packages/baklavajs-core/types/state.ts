export interface IState extends Record<string, any> {
    nodes: Array<INodeState<unknown, unknown>>;
    connections: IConnectionState[];
}

export interface INodeState<I, O> {
    type: string;
    title: string;
    id: string;
    inputs: { [K in keyof I]: I[K] extends INodeIOState<infer T> ? T : never };
    outputs: { [K in keyof O]: O[K] extends INodeIOState<infer T> ? T : never };
    state: any;
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
