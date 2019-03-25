export class BaklavaEvent<T> {

    eventType: string;
    data: T;

    constructor(eventType: string, data: T) {
        this.eventType = eventType;
        this.data = data;
    }

}

export class PreventableBaklavaEvent<T> extends BaklavaEvent<T> {

    private _isPrevented = false;
    public get isPrevented() {
        return this._isPrevented;
    }

    public preventDefault() {
        this._isPrevented = true;
    }

}
