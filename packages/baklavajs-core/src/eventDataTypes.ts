import { AbstractNodeConstructor } from "./node";
import { NodeInterface } from "./nodeInterface";

export interface IAddConnectionEventData {
    from: NodeInterface;
    to: NodeInterface;
}

export interface IAddNodeTypeEventData {
    typeName: string;
    type: AbstractNodeConstructor;
    category: string;
}
