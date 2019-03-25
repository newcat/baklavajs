import { Node, NodeInterface, Connection, IOption } from "../core";

// Editor
export interface INodeEventData {
    node: Node;
}

export interface IAddConnectionEventData {
    from: NodeInterface;
    to: NodeInterface;
}

export interface IConnectionEventData {
    connection: Connection;
}

// Node
export interface IAddInterfaceEventData {
    name: string;
    type: string;
    isInput: boolean;
    option?: string;
    defaultValue?: any;
}

export interface IInterfaceEventData {
    interface: NodeInterface;
}

export interface IAddOptionEventData {
    name: string;
    component: string;
    defaultValue: any;
    sidebarComponent?: string;
}

export interface IOptionEventData {
    option: IOption;
}
