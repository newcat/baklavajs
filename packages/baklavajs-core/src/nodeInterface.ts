import { BaklavaEvent, PreventableBaklavaEvent, SequentialHook } from "@baklavajs/events";
import generateId from "./idGenerator";
import { INodeInterface, INodeIOState } from "../types";
import { AbstractNode } from './node';

export class NodeInterface<T> implements INodeInterface<T> {
    public readonly type = "interface";

    public id = "ni_" + generateId();
    
    /** Will be set automatically after the node was created */
    public isInput?: boolean;
    /** Will be set automatically after the node was created */
    public parent?: AbstractNode;
    
    public component?: string | undefined;

    public events = {
        setConnectionCount: new BaklavaEvent<number>(),
        beforeSetValue: new PreventableBaklavaEvent<T>(),
        setValue: new BaklavaEvent<T>(),
        updated: new BaklavaEvent<void>(),
    };

    public hooks = {
        load: new SequentialHook<INodeIOState<T>>(),
        save: new SequentialHook<INodeIOState<T>>(),
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

    public constructor(value: T) {
        this._value = value;
    }

    public load(state: INodeIOState<T>): void {
        this.id = state.id;
        this.value = state.value;
        this.hooks.load.execute(state);
    }

    public save(): INodeIOState<T> {
        const state = {
            id: this.id,
            value: this.value,
        };
        return this.hooks.save.execute(state);
    }
}
