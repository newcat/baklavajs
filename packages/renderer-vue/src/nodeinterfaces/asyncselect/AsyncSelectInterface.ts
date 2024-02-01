import { type ComponentOptions, markRaw } from "vue";
import { NodeInterface } from "@baklavajs/core";
import AsyncSelectInterfaceComponent from "./AsyncSelectInterface.vue";

export type AsyncSelectOption = { label: string; value: any };
export interface AsyncSelectCallbackFunction {
    (...args: any[]): AsyncSelectOption[] | Promise<AsyncSelectOption[]>;
}

export class AsyncSelectInterface<V = string> extends NodeInterface<V> {
    component = markRaw(AsyncSelectInterfaceComponent) as ComponentOptions;
    callback: AsyncSelectCallbackFunction;

    constructor(name: string, value: V, callback: AsyncSelectCallbackFunction) {
        super(name, value);
        this.callback = callback;
    }
}

export { AsyncSelectInterfaceComponent };
