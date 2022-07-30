import { TokenType } from "./types";

export type GetListenersFn<F extends CallableFunction> = () => F[];

export class Subscribable<F extends CallableFunction> {
    private listenerMap: WeakMap<TokenType, F> = new Map();
    private _listeners: F[] = [];

    private proxyMap: WeakMap<TokenType, GetListenersFn<F>> = new Map();
    private proxies: Array<GetListenersFn<F>> = [];

    public get listeners() {
        return this._listeners.concat(this.proxies.flatMap((getListeners) => getListeners()));
    }

    /**
     * Subscribe to the event / hook
     * @param token A token that can be used to unsubscribe from the event / hook later on
     * @param callback A callback that will be invoked when the event / hook occurs
     */
    public subscribe(token: TokenType, callback: F) {
        if (this.listenerMap.has(token)) {
            console.warn(
                "Already subscribed. Unsubscribing for you.\n" +
                    "Please check that you don't accidentally use the same token twice " +
                    "to register two different handlers for the same event/hook.",
            );
            this.unsubscribe(token);
        }
        this.listenerMap.set(token, callback);
        this._listeners.push(callback);
    }

    /**
     * Remove a listener
     * @param token The token that was specified when subscribing to the listener.
     * An invalid token does not result in an error.
     */
    public unsubscribe(token: TokenType) {
        if (this.listenerMap.has(token)) {
            const callback = this.listenerMap.get(token)!;
            this.listenerMap.delete(token);
            const i = this._listeners.indexOf(callback);
            if (i >= 0) {
                this._listeners.splice(i, 1);
            }
        }
    }

    /** This function is only used internally for proxies */
    public registerProxy(token: TokenType, getListeners: GetListenersFn<F>) {
        if (this.proxyMap.has(token)) {
            console.warn(
                "Already subscribed. Unsubscribing for you.\n" +
                    "Please check that you don't accidentally use the same token twice " +
                    "to register two different proxies for the same event/hook.",
            );
            this.unregisterProxy(token);
        }
        this.proxyMap.set(token, getListeners);
        this.proxies.push(getListeners);
    }

    /** This function is only used internally for proxies */
    public unregisterProxy(token: TokenType) {
        if (!this.proxyMap.has(token)) {
            return;
        }
        const getListeners = this.proxyMap.get(token)!;
        this.proxyMap.delete(token);
        const i = this.proxies.indexOf(getListeners);
        if (i >= 0) {
            this.proxies.splice(i, 1);
        }
    }
}
