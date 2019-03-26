export type TokenType = object|symbol;
export type Listener<T> = (ev: T) => any;

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
        for (const l of this.listeners.values()) {
            if (l(data) === false) {
                return true;
            }
        }
        return false;
    }

}
