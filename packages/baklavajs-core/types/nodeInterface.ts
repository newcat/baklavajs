import { INode } from "./node";
import { INodeIO } from "./nodeIO";

export interface INodeInterface<T> extends INodeIO<T> {

    /** Additional Properties */
    [k: string]: any;

    type: "interface";
    isInput: boolean;
    parent: INode<any, any>;
    component?: string;
    connectionCount: number;

}
