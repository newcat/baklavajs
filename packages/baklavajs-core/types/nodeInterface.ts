import { INode } from "./node";
import { IBaklavaEvent, IPreventableBaklavaEvent, IHook } from "../../baklavajs-events/types";
import { IInterfaceState } from "./state";

export interface INodeInterface {
    /** Additional Properties */
    [k: string]: any;

    id: string;
    isInput: boolean;
    parent: INode;
    option?: string;

    events: {
        setConnectionCount: IBaklavaEvent<number>;
        beforeSetValue: IPreventableBaklavaEvent<any>;
        setValue: IBaklavaEvent<any>;
        updated: IBaklavaEvent<void>;
    };

    hooks: {
        load: IHook<IInterfaceState>;
        save: IHook<IInterfaceState>;
    };

    connectionCount: number;
    value: any;

    load(state: IInterfaceState): void;
    save(): IInterfaceState;
}
