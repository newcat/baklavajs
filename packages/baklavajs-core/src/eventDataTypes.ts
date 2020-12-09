import { NodeConstructor } from "./node";
import { INodeIO } from "./nodeIO";

// Editor
export interface IAddConnectionEventData {
    from: INodeIO<unknown>;
    to: INodeIO<unknown>;
}

export interface IAddNodeTypeEventData {
    typeName: string;
    type: NodeConstructor;
    category: string;
}
