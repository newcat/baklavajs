import { Node } from "./node";
import generateId from "./idGenerator";
import { IInterfaceState } from "./state";
import { BaklavaEvent, PreventableBaklavaEvent } from "./events";

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
    }

    public save(): IInterfaceState {
        return {
            id: this.id,
            value: this.value
        };
    }

}
