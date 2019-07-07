import { INodeInterface } from "./nodeInterface";
import { NodeConstructor } from "./editor";
import { INodeOption } from "./nodeOption";

// Editor
export interface IAddConnectionEventData {
    from: INodeInterface;
    to: INodeInterface;
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
    option: INodeOption;
}

export interface INodeUpdateEventData {
    name: string;
    option?: INodeOption;
    interface?: INodeInterface;
}
