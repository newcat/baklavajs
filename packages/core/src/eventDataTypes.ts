import type { AbstractNodeConstructor } from "./node";
import type { NodeInterface } from "./nodeInterface";

export interface IAddConnectionEventData {
    from: NodeInterface;
    to: NodeInterface;
}

export interface IRegisterNodeTypeOptions {
    /** Category of the node. Can be used to structure the node palette view */
    category?: string;
    /** Set the title of the node in the node palette. Will use the `title` property of the node when not specified */
    title?: string;
}

export interface IAddNodeTypeEventData {
    type: AbstractNodeConstructor;
    options?: IRegisterNodeTypeOptions;
}

export interface INodeUpdateEventData {
    type: "input" | "output";
    name: string;
    intf: NodeInterface;
}
