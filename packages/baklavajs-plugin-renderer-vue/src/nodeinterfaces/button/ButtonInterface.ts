import { NodeInterface } from "@baklavajs/core";
import ButtonInterfaceComponent from "./ButtonInterface.vue";

export class ButtonInterface extends NodeInterface<never> {
    public component = ButtonInterfaceComponent;
    public callback?: () => void;
}

export { ButtonInterfaceComponent };
