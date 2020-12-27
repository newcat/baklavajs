import { NodeInterface } from "@baklavajs/core";
import SelectInterfaceComponent from "./SelectInterface.vue";

export interface IAdvancedSelectInterfaceItem<V> {
    text: string;
    value: V;
}

export type SelectInterfaceItem<V> = string | IAdvancedSelectInterfaceItem<V>;

export class SelectInterface<V = string> extends NodeInterface<V | undefined> {
    component = SelectInterfaceComponent;
    items: SelectInterfaceItem<V>[];

    constructor(name: string, value: V | undefined, items: SelectInterfaceItem<V>[]) {
        super(name, value);
        this.items = items;
    }
}

export { SelectInterfaceComponent };
