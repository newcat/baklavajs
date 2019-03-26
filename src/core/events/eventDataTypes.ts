import { NodeInterface, IOption, NodeOption } from "..";

// Editor
export interface IAddConnectionEventData {
    from: NodeInterface;
    to: NodeInterface;
}

// Node
export interface IAddInterfaceEventData {
    name: string;
    isInput: boolean;
    option?: string;
    defaultValue?: any;
}

export interface IAddOptionEventData {
    name: string;
    component: string;
    defaultValue: any;
    sidebarComponent?: string;
}

export interface IOptionEventData {
    name: string;
    option: IOption;
}

export interface INodeUpdateEventData {
    name: string;
    option?: NodeOption;
    interface?: NodeInterface;
}
