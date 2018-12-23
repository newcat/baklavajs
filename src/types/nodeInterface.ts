import { INode } from "./node";

export interface INodeInterface {
    id: string;
    name: string;
    type: string;
    isInput: boolean;
    parent: INode;
}
