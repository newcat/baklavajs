type TokenType = object|symbol;
type Listener<T> = (ev: T) => any;

class BaklavaEvent<T> {

    private listeners: Map<TokenType, Listener<T>> = new Map();

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
