import { INodeInterface } from "./nodeInterface";

export interface INode {
    id: string;
    type: string;
    name: string;
    position: {
        x: number;
        y: number;
    };
    state?: any;
    interfaces: INodeInterface[];
}
