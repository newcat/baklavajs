import { TokenType } from "./types";

export type HookTap<I, O> = (i: I) => O;

export interface IBaklavaTapable {
    hooks: Record<string, Hook<any, any>>;
}

/** Base class for hooks in Baklava */
export abstract class Hook<I, O = I> {
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
            if (i >= 0) {
                this.taps.splice(i, 1);
            }
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
