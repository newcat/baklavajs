import generateId from "./idGenerator";
import { IInterfaceState } from "../types/state";
import { BaklavaEvent, PreventableBaklavaEvent, SequentialHook } from "@baklavajs/events";
import { INodeInterface, INode } from "../types";

export class NodeInterface implements INodeInterface {
    public id: string;
    public isInput: boolean;
    public parent: INode;
    public option?: string;

    [k: string]: any;

    public events = {
        setConnectionCount: new BaklavaEvent<number>(),
        beforeSetValue: new PreventableBaklavaEvent<any>(),
        setValue: new BaklavaEvent<any>(),
        updated: new BaklavaEvent<void>()
    };

    public hooks = {
        load: new SequentialHook<IInterfaceState>(),
        save: new SequentialHook<IInterfaceState>()
    };

    private _connectionCount = 0;
    public set connectionCount(v: number) {
        this._connectionCount = v;
        this.events.setConnectionCount.emit(v);
    }
    public get connectionCount() {
        return this._connectionCount;
    }

    private _value: any = null;
    public set value(v: any) {
        if (this.events.beforeSetValue.emit(v)) {
            return;
        }
        this._value = v;
        this.events.setValue.emit(v);
    }
    public get value() {
        return this._value;
    }

    public constructor(parent: INode, isInput: boolean) {
        this.parent = parent;
        this.isInput = isInput;
        this.id = "ni_" + generateId();
    }

    public load(state: IInterfaceState) {
        this.id = state.id;
        this.value = state.value;
        this.hooks.load.execute(state);
    }

    public save(): IInterfaceState {
        const state = {
            id: this.id,
            value: this.value
        };
        return this.hooks.save.execute(state);
    }
}
