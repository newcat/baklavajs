import { IBaklavaEvent, IHook } from "../types";

export type TokenType = object|symbol;
export type Listener<T> = (ev: T) => any;
export type HookTap<I, O> = (i: I) => O;

/** Main event class for Baklava */
export class BaklavaEvent<T> implements IBaklavaEvent<T> {

    protected listeners: Map<TokenType, Listener<T>> = new Map();

    /**
     * Subscribe to the event
     * @param token A token that can be used to unsubscribe from the event later on
     * @param listener A callback that will be invoked when the event occurs
     */
    public addListener(token: TokenType, listener: Listener<T>) {
        this.listeners.set(token, listener);
    }

    /**
     * Remove a listener
     * @param token The token that was specified when subscribing to the listener.
     * An invalid token does not result in an error.
     */
    public removeListener(token: TokenType) {
        if (this.listeners.has(token)) {
            this.listeners.delete(token);
        }
    }

    /**
     * Invoke all listeners
     * @param data The data to invoke the listeners with.
     */
    emit(data: T) {
        this.listeners.forEach((l) => l(data));
    }

}

/** Extension for the [[BaklavaEvent]] class. A listener can return `false` to prevent
 * this event from happening.
 */
export class PreventableBaklavaEvent<T> extends BaklavaEvent<T> implements IBaklavaEvent<T> {

    /**
     * Invoke all listeners.
     * @param data The data to invoke all listeners with
     * @returns `true` when one of the listeners requested to prevent the event, otherwise `false`
     */
    emit(data: T) {
        for (const l of Array.from(this.listeners.values())) {
            if (l(data) === false) {
                return true;
            }
        }
        return false;
    }

}

/** Base class for hooks in Baklava */
export abstract class Hook<I, O = I> implements IHook<I, O> {

    private tapMap: Map<TokenType, HookTap<I, O>> = new Map();
    protected taps: Array<HookTap<I, O>> = [];

    public tap(token: TokenType, tapFn: HookTap<I, O>) {
        if (this.tapMap.has(token)) {
            this.untap(token);
        }
        this.tapMap.set(token, tapFn);
        this.taps.push(tapFn);
    }

    public untap(token: TokenType) {
        if (this.tapMap.has(token)) {
            const tapFn = this.tapMap.get(token)!;
            this.tapMap.delete(token);
            const i = this.taps.indexOf(tapFn);
            if (i >= 0) { this.taps.splice(i, 1); }
        }
    }

    public abstract execute(data: I): O;

}

/** This class will run the taps one after each other and pass the data from every tap to another. */
export class SequentialHook<T> extends Hook<T> {

    public execute(data: T): T {
        let currentValue = data;
        for (const tapFn of this.taps) {
            currentValue = tapFn(currentValue);
        }
        return currentValue;
    }

}
