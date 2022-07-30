import { type ComponentOptions, markRaw } from "vue";
import { NodeInterface } from "@baklavajs/core";
import ButtonInterfaceComponent from "./ButtonInterface.vue";

export class ButtonInterface extends NodeInterface<undefined> {
    public component = markRaw(ButtonInterfaceComponent) as ComponentOptions;
    public callback?: () => void;

    public constructor(name: string, callback: () => void) {
        super(name, undefined);
        this.callback = callback;
        this.setPort(false);
    }
}

export { ButtonInterfaceComponent };
