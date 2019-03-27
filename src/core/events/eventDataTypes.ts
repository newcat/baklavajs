import { NodeInterface, IOption, NodeOption } from "..";
import { NodeConstructor } from "../editor";

// Editor
export interface IAddConnectionEventData {
    from: NodeInterface;
    to: NodeInterface;
}

export interface IAddNodeTypeEventData {
    typeName: string;
    type: NodeConstructor;
    category: string;
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
