import { NodeInterface } from "@baklavajs/core";
import ButtonInterfaceComponent from "./ButtonInterface.vue";

export class ButtonInterface extends NodeInterface<undefined> {
    public component = ButtonInterfaceComponent;
    public callback?: () => void;

    public constructor(name: string, callback: () => void) {
        super(name, undefined);
        this.callback = callback;
    }
}

export { ButtonInterfaceComponent };
