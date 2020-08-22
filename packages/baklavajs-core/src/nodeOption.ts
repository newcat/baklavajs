import { INodeOption } from "../types/nodeOption";
import { PreventableBaklavaEvent, BaklavaEvent } from "@baklavajs/events";

export class NodeOption implements INodeOption {
    /** Name of the component that should be displayed for the option */
    public optionComponent: string;
    /** Name of the component that should be displayed in the sidebar */
    public sidebarComponent?: string;

    public events = {
        beforeSetValue: new PreventableBaklavaEvent<any>(),
        setValue: new BaklavaEvent<any>(),
        updated: new BaklavaEvent<void>()
    };

    /** Additional Properties */
    [k: string]: any;

    private _value: any;

    public constructor(optionComponent: string, value?: any, sidebarComponent?: any) {
        this.optionComponent = optionComponent;
        this.sidebarComponent = sidebarComponent;
        this._value = value;
    }

    public get value() {
        return this._value;
    }

    public set value(v: any) {
        if (this.events.beforeSetValue.emit(v)) {
            return;
        }
        this._value = v;
        this.events.setValue.emit(v);
    }
}
