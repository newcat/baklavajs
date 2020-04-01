export type TokenType = object|symbol;
export type Listener<T> = (ev: T) => any;
export type HookTap<I, O> = (i: I) => O;

export interface IBaklavaEvent<T> {
    addListener(token: TokenType, listener: Listener<T>): void;
    removeListener(token: TokenType): void;
    emit(data: T): void;
}

export interface IPreventableBaklavaEvent<T> extends IBaklavaEvent<T> {
    emit(data: T): boolean;
}

export interface IHook<I, O = I> {
    tap(token: TokenType, tapFn: HookTap<I, O>): void;
    untap(token: TokenType): void;
    execute(data: I): O;
}
