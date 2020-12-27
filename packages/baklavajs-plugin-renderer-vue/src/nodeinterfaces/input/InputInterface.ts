import { NodeInterface } from "@baklavajs/core";
import InputInterfaceComponent from "./InputInterface.vue";

export class InputInterface extends NodeInterface<string> {
    component = InputInterfaceComponent;
}

export { InputInterfaceComponent };
