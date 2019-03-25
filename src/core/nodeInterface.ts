import { Node } from "./node";
import generateId from "./idGenerator";
import { IInterfaceState } from "./state";
import { BaklavaEventEmitter, IValueEventData } from "../events";

export class NodeInterface extends BaklavaEventEmitter {

    public id: string;
    public isInput: boolean;
    public connectionCount = 0;
    public type: string;
    public parent: Node;
    public option?: string;

    private _value: any = null;

    public set value(v: any) {
        if (this.emitPreventable<IValueEventData>("beforeSetValue", { value: v })) { return; }
        this._value = v;
        this.emit<IValueEventData>("setValue", { value: v });
    }
    public get value() {
        return this._value;
    }

    public constructor(parent: Node, isInput: boolean, type: string) {
        super();
        this.parent = parent;
        this.isInput = isInput;
        this.id = "ni_" + generateId();
        this.type = type;
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
