import { IPreventableBaklavaEvent, IBaklavaEvent, IHook } from "../../baklavajs-events/types";
import { INodeIOState } from "./state";

export interface INodeIO<T> {

    id: string;
    type: "interface"|"option";

    events: {
        beforeSetValue: IPreventableBaklavaEvent<T>,
        setValue: IBaklavaEvent<T>
    };

    hooks: {
        load: IHook<INodeIOState<T>>,
        save: IHook<INodeIOState<T>>
    };

    value: T;

    load(state: INodeIOState<T>): void;
    save(): INodeIOState<T>;

}

export type IODefinition = Record<string, INodeIO<any>>;
export type IODefinitionValues<D extends IODefinition> = { [K in keyof D]: D[K] extends INodeIO<infer T> ? T : never };
