import { BaklavaEvent, PreventableBaklavaEvent } from "./event";

type Listener = (ev?: BaklavaEvent<any>) => any;

export class BaklavaEventEmitter {

    private listeners = new Map<string, Set<Listener>>();

    public addListener(eventType: string, listener: Listener) {
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

    protected emit<T>(eventType: string, data: T): void {
        const listeners = this.listeners.get(eventType);
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
        const listeners = this.listeners.get(eventType);
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

}
