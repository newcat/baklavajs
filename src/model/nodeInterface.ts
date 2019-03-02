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
    private _value: any = null;

    public set value(v: any) {
        this._value = v;
        this.listeners.forEach((l) => l.f.call(l.t, v));
    }
    public get value() {
        return this._value;
    }

    public constructor(parent: Node, isInput: boolean, type: string) {
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

    /**
     * Register a callback function that is called whenever the value of the interface changes.
     * Used primarily for connections to work (they will "transmit" the value from one interface
     * to another when the value changes.)
     * Note: Inline ES6 arrow functions won't work as you need a reference to the callback
     * later to unregister the listener.
     * @param thisValue The value `this` will be bound to in the callback function.
     * @param cb The callback function that will be called with the new value as parameter.
     */
    public registerListener(thisValue: any, cb: ListenerType) {
        this.listeners.push({ t: thisValue, f: cb });
    }

    /**
     * Unregisters a listener.
     * @param cb The reference to the callback function.
     */
    public unregisterListener(cb: ListenerType) {
        const index = this.listeners.findIndex((x) => x.f === cb);
        if (index) {
            this.listeners.splice(index, 1);
        }
    }

}
