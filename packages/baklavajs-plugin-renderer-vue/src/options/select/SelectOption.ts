import { NodeOption } from "@baklavajs/core";

export interface IAdvancedSelectOptionItem<V> {
    text: string;
    value: V;
}

export type SelectOptionItem<V> = string | IAdvancedSelectOptionItem<V>;

export class SelectOption<V = string> extends NodeOption<V | undefined> {
    items: SelectOptionItem<V>[];

    constructor(name: string, value: V | undefined, items: SelectOptionItem<V>[]) {
        super(name, value);
        this.items = items;
    }
}
