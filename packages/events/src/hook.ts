import { Subscribable } from "./subscribable";

export type HookTap<I, O, E> = (i: I, entity: E) => O;

export interface IBaklavaTapable {
    hooks: Record<string, Subscribable<HookTap<any, any, any>>>;
}

/** Similar to the SequentialHook, but allows to pass a different entity for each execute call */
export class DynamicSequentialHook<I, E, O extends I = I> extends Subscribable<HookTap<I, O, E>> {
    public execute(data: I, entity: E): O {
        let currentValue: O = data as O;
        for (const callback of this.listeners) {
            currentValue = callback(currentValue, entity);
        }
        return currentValue;
    }
}

/** This class will run the taps one after each other and pass the data from every subscriber to another. */
export class SequentialHook<I, E, O extends I = I> extends DynamicSequentialHook<I, E, O> {
    public constructor(protected readonly entity: E) {
        super();
    }

    public execute(data: I): O {
        return super.execute(data, this.entity);
    }
}
