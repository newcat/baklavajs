import { markRaw } from "vue";
import { NodeInterface } from "@baklavajs/core";
import CheckboxInterfaceComponent from "./CheckboxInterface.vue";

export class CheckboxInterface extends NodeInterface<boolean> {
    component = markRaw(CheckboxInterfaceComponent);
}

export { CheckboxInterfaceComponent };
