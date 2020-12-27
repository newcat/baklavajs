import { NodeConstructor } from "./node";
import { NodeInterface } from "./nodeInterface";

export interface IAddConnectionEventData {
    from: NodeInterface;
    to: NodeInterface;
}

export interface IAddNodeTypeEventData {
    typeName: string;
    type: NodeConstructor;
    category: string;
}
