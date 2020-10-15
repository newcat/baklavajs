import { INode } from "./node";
import { INodeIO, IODefinition } from "./nodeIO";

export interface INodeInterface<T> extends INodeIO<T> {

    /** Additional Properties */
    [k: string]: any;

    type: "interface";
    isInput?: boolean;
    parent?: INode<IODefinition, IODefinition>;
    component?: string;
    connectionCount: number;

}
