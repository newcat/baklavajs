import { Subscribable } from "./subscribable";

export type HookTap<I, O, E> = (i: I, entity: E) => O;

export interface IBaklavaTapable {
    hooks: Record<string, Hook<any, any, any>>;
}

/** Base class for hooks in Baklava */
export abstract class Hook<I, O, E> extends Subscribable<HookTap<I, O, E>> {
    public constructor(protected readonly entity: E) {
        super();
    }
    public abstract execute(data: I): O;
}

/** This class will run the taps one after each other and pass the data from every subscriber to another. */
export class SequentialHook<T, E> extends Hook<T, T, E> {
    public execute(data: T): T {
        let currentValue = data;
        for (const callback of this.listeners) {
            currentValue = callback(currentValue, this.entity);
        }
        return currentValue;
    }
}
