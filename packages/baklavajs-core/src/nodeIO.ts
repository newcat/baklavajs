import type { SequentialHook, BaklavaEvent, PreventableBaklavaEvent } from "@baklavajs/events";

export interface INodeIOState<T> extends Record<string, any> {
    id: string;
    value: T;
}

export interface INodeIO<T> {
    id: string;
    type: "interface" | "option";

    events: {
        beforeSetValue: PreventableBaklavaEvent<T>;
        setValue: BaklavaEvent<T>;
    };

    hooks: {
        load: SequentialHook<INodeIOState<T>>;
        save: SequentialHook<INodeIOState<T>>;
    };

    value: T;

    load(state: INodeIOState<T>): void;
    save(): INodeIOState<T>;
}

export type IODefinition = Record<string, INodeIO<unknown>>;
export type IODefinitionValues<D extends IODefinition> = { [K in keyof D]: D[K] extends INodeIO<infer T> ? T : never };
export type IODefinitionStates<D> = { [K in keyof D]: D[K] extends INodeIO<infer T> ? INodeIOState<T> : never };
