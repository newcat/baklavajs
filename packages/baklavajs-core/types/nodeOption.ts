import { IBaklavaEvent, IPreventableBaklavaEvent } from "./events";

export interface INodeOption {
    optionComponent: string;
    value: any;
    sidebarComponent?: string;

    events: {
        beforeSetValue: IPreventableBaklavaEvent<any>,
        setValue: IBaklavaEvent<any>
    };

}
