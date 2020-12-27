import { NodeInterface } from "@baklavajs/core";
import TextInputInterfaceComponent from "./TextInputInterface.vue";

export class TextInputInterface extends NodeInterface<string> {
    component = TextInputInterfaceComponent;
}

export { TextInputInterfaceComponent };
