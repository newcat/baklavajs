import { BaklavaEventEmitter, IValueEventData } from "./events";

export interface IOption {
    optionComponent: string;
    value: any;
    sidebarComponent?: string;
}

export class NodeOption extends BaklavaEventEmitter implements IOption {

    public optionComponent: string;
    public sidebarComponent?: string;

    private _value: any;

    public constructor(optionComponent: string, value?: any, sidebarComponent?: any) {
        super();
        this.optionComponent = optionComponent;
        this.sidebarComponent = sidebarComponent;
        this._value = value;
    }

    public get value() {
        return this._value;
    }

    public set value(v: any) {
        if (this.emitPreventable<IValueEventData>("beforeSetValue", { value: v })) { return; }
        this._value = v;
        this.emit<IValueEventData>("setValue", { value: v });
    }

}
