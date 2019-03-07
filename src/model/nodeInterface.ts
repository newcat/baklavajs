import { Node } from "./node";
import generateId from "../utility/idGenerator";
import { VueConstructor } from "vue";
import { IInterfaceState } from "./state";

export type ListenerType = (value: any) => void;

export class NodeInterface {

    public id: string;
    public isInput: boolean;
    public connectionCount = 0;
    public type: string;
    public parent: Node;
    public option?: VueConstructor;

    private listeners: Array<(v: any) => void> = [];
    private _value: any = null;

    public set value(v: any) {
        this._value = v;
        this.listeners.forEach((l) => l(v));
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
     * @param cb The callback function that will be called with the new value as parameter.
     * @returns Unsubscribe function. Call the returned function to unsubscribe.
     */
    public registerListener(cb: ListenerType): () => void {
        this.listeners.push(cb);
        return () => {
            const index = this.listeners.indexOf(cb);
            if (index >= 0) {
                this.listeners.splice(index, 1);
            }
        };
    }

}
