import { BaklavaEvent, PreventableBaklavaEvent } from "./event";

type Listener<T> = (ev: BaklavaEvent<T>) => any;
type PreventableListener<T> = (ev: PreventableBaklavaEvent<T>) => any;

export class BaklavaEventEmitter {

    private listeners = new Map<string, Set<Listener<any>>>();

    public addListener<T>(eventType: string, listener: Listener<T>) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        const set = this.listeners.get(eventType)!;
        set.add(listener);
        return () => {
            if (set.has(listener)) {
                set.delete(listener);
            }
        };
    }

    public addPreventableListener<T>(eventType: string, listener: PreventableListener<T>) {
        return this.addListener<T>(eventType, listener as Listener<T>);
    }

    protected emit<T>(eventType: string, data: T): void {
        const listeners = this.getListenersForEvent(eventType);
        if (listeners) {
            listeners.forEach((l) => l(new BaklavaEvent(eventType, data)));
        }
    }

    /**
     * Emit the event `eventType`.
     * @param eventType Type of the event
     * @param data The data associated with the event
     * @returns `true` if the event was prevented, `false` otherwise.
     */
    protected emitPreventable<T>(eventType: string, data: T): boolean {
        const listeners = this.getListenersForEvent(eventType);
        if (listeners) {
            for (const l of listeners) {
                const ev = new PreventableBaklavaEvent(eventType, data);
                l(ev);
                if (ev.isPrevented) {
                    return true;
                }
            }
        }
        return false;
    }

    private getListenersForEvent(eventType: string) {
        const listeners = new Set<Listener<any>>();
        const x = this.listeners.get(eventType);
        if (x) { x.forEach((l) => listeners.add(l)); }
        const y = this.listeners.get("*");
        if (y) { y.forEach((l) => listeners.add(l)); }
        return listeners;
    }

}
