import { Node } from "./node";
import generateId from "./idGenerator";
import { IInterfaceState } from "./state";
import { BaklavaEvent, PreventableBaklavaEvent, SequentialHook } from "./events";

export class NodeInterface {

    public id: string;
    public isInput: boolean;
    public parent: Node;
    public option?: string;

    public events = {
        setConnectionCount: new BaklavaEvent<number>(),
        beforeSetValue: new PreventableBaklavaEvent<any>(),
        setValue: new BaklavaEvent<any>()
    };

    public hooks = {
        load: new SequentialHook<IInterfaceState & Record<string, any>>(),
        save: new SequentialHook<IInterfaceState & Record<string, any>>()
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
        if (this.events.beforeSetValue.emit(v)) { return; }
        this._value = v;
        this.events.setValue.emit(v);
    }
    public get value() {
        return this._value;
    }

    public constructor(parent: Node, isInput: boolean) {
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
