export interface IState extends Record<string, any> {
    nodes: INodeState[];
    connections: IConnectionState[];
}

export interface INodeState extends Record<string, any> {
    type: string;
    name: string;
    id: string;
    interfaces: Array<[string, IInterfaceState]>;
    options: Array<[string, any]>;
    state: any;
}

export interface IInterfaceState extends Record<string, any> {
    id: string;
    value: any;
}

export interface IConnectionState extends Record<string, any> {
    id: string;
    from: string;
    to: string;
}
