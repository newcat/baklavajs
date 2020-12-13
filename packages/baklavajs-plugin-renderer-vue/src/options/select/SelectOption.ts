import { NodeOption } from "@baklavajs/core";
import SelectOptionComponent from "./SelectOption.vue";

export interface IAdvancedSelectOptionItem<V> {
    text: string;
    value: V;
}

export type SelectOptionItem<V> = string | IAdvancedSelectOptionItem<V>;

export class SelectOption<V = string> extends NodeOption<V | undefined> {
    component = SelectOptionComponent;
    items: SelectOptionItem<V>[];

    constructor(name: string, value: V | undefined, items: SelectOptionItem<V>[]) {
        super(name, value);
        this.items = items;
    }
}
