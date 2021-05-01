import { Listener, TokenType } from "./types";

export interface IBaklavaEventEmitter {
    events: Record<string, BaklavaEvent<any>>;
}

/** Main event class for Baklava */
export class BaklavaEvent<T> {
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
export class PreventableBaklavaEvent<T> extends BaklavaEvent<T> {
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
