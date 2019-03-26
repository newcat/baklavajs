export type TokenType = object|symbol;
export type Listener<T> = (ev: T) => any;
export type HookTap<I, O> = (i: I) => O;

export class BaklavaEvent<T> {

    protected listeners: Map<TokenType, Listener<T>> = new Map();

    public addListener(token: TokenType, listener: Listener<T>) {
        this.listeners.set(token, listener);
    }

    public removeListener(token: TokenType) {
        if (this.listeners.has(token)) {
            this.listeners.delete(token);
        }
    }

    emit(data: T) {
        this.listeners.forEach((l) => l(data));
    }

}

export class PreventableBaklavaEvent<T> extends BaklavaEvent<T> {

    emit(data: T) {
        for (const l of Array.from(this.listeners.values())) {
            if (l(data) === false) {
                return true;
            }
        }
        return false;
    }

}

abstract class Hook<I, O = I> {

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

export class SequentialHook<T> extends Hook<T> {

    public execute(data: T): T {
        let currentValue = data;
        for (const tapFn of this.taps) {
            currentValue = tapFn(currentValue);
        }
        return currentValue;
    }

}
