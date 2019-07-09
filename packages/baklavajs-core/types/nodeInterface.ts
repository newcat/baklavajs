import { INode } from "./node";
import { IBaklavaEvent, IPreventableBaklavaEvent } from "./events";
import { IInterfaceState } from "./state";

export interface INodeInterface {

    id: string;
    isInput: boolean;
    parent: INode;
    option?: string;

    events: {
        setConnectionCount: IBaklavaEvent<number>,
        beforeSetValue: IPreventableBaklavaEvent<any>,
        setValue: IBaklavaEvent<any>
    };

    connectionCount: number;
    value: any;

    load(state: IInterfaceState): void;
    save(): IInterfaceState;

}
