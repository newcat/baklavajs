export interface IState {
    nodes: INodeState[];
    connections: IConnectionState[];
}

export interface INodeState {
    type: string;
    name: string;
    id: string;
    interfaces: Array<[string, IInterfaceState]>;
    options: Array<[string, any]>;
    position: { x: number, y: number };
    state: any;
}

export interface IInterfaceState {
    id: string;
    value: any;
}

export interface IConnectionState {
    id: string;
    from: string;
    to: string;
}
