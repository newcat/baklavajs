import { v4 as uuidv4 } from "uuid";
import { PreventableBaklavaEvent, BaklavaEvent, SequentialHook } from "@baklavajs/events";
import { INodeIO, INodeIOState } from "./nodeIO";

export class NodeOption<T = unknown, C = unknown> implements INodeIO<T, C> {
    public readonly type = "option";
    public id = uuidv4();
    public name: string;

    public component?: C;

    public events = {
        beforeSetValue: new PreventableBaklavaEvent<any>(),
        setValue: new BaklavaEvent<any>(),
        updated: new BaklavaEvent<void>(),
    };

    public hooks = {
        load: new SequentialHook<INodeIOState<T>>(),
        save: new SequentialHook<INodeIOState<T>>(),
    };

    private _value: T;

    public get value(): T {
        return this._value;
    }

    public set value(v: T) {
        if (this.events.beforeSetValue.emit(v)) {
            return;
        }
        this._value = v;
        this.events.setValue.emit(v);
    }

    public constructor(name: string, value: T) {
        this.name = name;
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
