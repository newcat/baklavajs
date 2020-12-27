import { NodeInterface } from "@baklavajs/core";
import CheckboxInterfaceComponent from "./CheckboxInterface.vue";

export class CheckboxInterface extends NodeInterface<boolean> {
    component = CheckboxInterfaceComponent;
}

export { CheckboxInterfaceComponent };
