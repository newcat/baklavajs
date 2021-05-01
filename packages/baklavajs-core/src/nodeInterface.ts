import { v4 as uuidv4 } from "uuid";
import {
    SequentialHook,
    BaklavaEvent,
    PreventableBaklavaEvent,
    IBaklavaEventEmitter,
    IBaklavaTapable,
} from "@baklavajs/events";

export interface INodeInterfaceState<T> extends Record<string, any> {
    id: string;
    value: T;
}

export class NodeInterface<T = any> implements IBaklavaEventEmitter, IBaklavaTapable {
    public id = uuidv4();
    public name: string;

    /** Will be set automatically after the node was created */
    public isInput?: boolean;

    /** Whether to show the port (the thing connections connect to) */
    public port = true;

    /** The component which will be displayed when the interface is not connected or port === false */
    public component?: any;

    public events = {
        setConnectionCount: new BaklavaEvent<number>(),
        beforeSetValue: new PreventableBaklavaEvent<T>(),
        setValue: new BaklavaEvent<T>(),
        updated: new BaklavaEvent<void>(),
    };

    public hooks = {
        load: new SequentialHook<INodeInterfaceState<T>>(),
        save: new SequentialHook<INodeInterfaceState<T>>(),
    };

    private _connectionCount = 0;
    public set connectionCount(v: number) {
        this._connectionCount = v;
        this.events.setConnectionCount.emit(v);
    }
    public get connectionCount(): number {
        return this._connectionCount;
    }

    private _value: T;
    public set value(v: T) {
        if (this.events.beforeSetValue.emit(v)) {
            return;
        }
        this._value = v;
        this.events.setValue.emit(v);
    }
    public get value(): T {
        return this._value;
    }

    public constructor(name: string, value: T) {
        this.name = name;
        this._value = value;
    }

    public load(state: INodeInterfaceState<T>): void {
        this.id = state.id;
        this.value = state.value;
        this.hooks.load.execute(state);
    }

    public save(): INodeInterfaceState<T> {
        const state = {
            id: this.id,
            value: this.value,
        };
        return this.hooks.save.execute(state);
    }

    public setComponent(value: any): this {
        this.component = value;
        return this;
    }

    public setPort(value: boolean): this {
        this.port = value;
        return this;
    }
}

export type NodeInterfaceDefinition<T> = {
    [K in keyof T]: NodeInterface<T[K]>;
};
export type NodeInterfaceDefinitionStates<T> = {
    [K in keyof T]: INodeInterfaceState<T[K]>;
};
