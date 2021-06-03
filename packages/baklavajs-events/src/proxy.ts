import { Subscribable } from "./subscribable";

export interface ISubscribableProxy<T extends Record<string, Subscribable<any>>> {
    addTarget(target: T): void;
    removeTarget(target: T): void;
    destroy(): void;
}

export function createProxy<T extends Record<string, Subscribable<any>>>(): T & ISubscribableProxy<T> {
    const token = Symbol();
    const listeners: Map<string, Subscribable<any>> = new Map();
    const targets: Set<T> = new Set();

    const register = (key: string, subscribable: Subscribable<any>) => {
        subscribable.registerProxy(token, () => listeners.get(key)?.listeners ?? []);
    };

    const addSubscribable = (key: string) => {
        const subscribable = new Subscribable();
        listeners.set(key, subscribable);
        targets.forEach((t) => register(key, t[key]));
    };

    const addTarget = (target: T): void => {
        targets.add(target);
        for (const key of listeners.keys()) {
            register(key, target[key]);
        }
    };

    const removeTarget = (target: T): void => {
        for (const key of listeners.keys()) {
            target[key].unregisterProxy(token);
        }
        targets.delete(target);
    };

    const destroy = (): void => {
        targets.forEach((t) => removeTarget(t));
        listeners.clear();
    };

    return new Proxy<T & ISubscribableProxy<T>>({} as any, {
        get(target, key: string) {
            if (key === "addTarget") {
                return addTarget;
            } else if (key === "removeTarget") {
                return removeTarget;
            } else if (key === "destroy") {
                return destroy;
            }
            if (typeof key !== "string" || key.startsWith("_")) {
                // vue internally uses properties starting with _ -> we just ignore them
                // also ignore all other properties that arent valid indexes for the events/hooks objects
                return target[key];
            }
            if (!listeners.has(key)) {
                addSubscribable(key);
            }
            return listeners.get(key)!;
        },
    });
}
