import { Node } from "./node";
import generateId from "../utility/idGenerator";
import { VueConstructor } from "vue";
import { IInterfaceState } from "./state";

type ListenerType = (value: any) => void;
interface IListener {
    t: any;
    f: ListenerType;
}

export class NodeInterface {

    public id: string;
    public isInput: boolean;
    public connectionCount = 0;
    public type: string;
    public parent: Node;
    public option?: VueConstructor;

    private listeners: IListener[] = [];
    private _value: any;

    public set value(v: any) {
        this._value = v;
        this.listeners.forEach((l) => l.f.call(l.t, v));
    }
    public get value() {
        return this._value;
    }

    public constructor(parent: Node, isInput: boolean, type: string, option?: VueConstructor) {
        this.parent = parent;
        this.isInput = isInput;
        this.id = "ni_" + generateId();
        this.type = type;
        this.option = option;
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

    /* Listeners */
    public registerListener(t: any, cb: ListenerType) {
        this.listeners.push({ t, f: cb });
    }

    public unregisterListener(cb: ListenerType) {
        const index = this.listeners.findIndex((x) => x.f === cb);
        if (index) {
            this.listeners.splice(index, 1);
        }
    }

}
