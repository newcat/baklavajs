import { NodeInterface } from "@baklavajs/core";
import CheckboxOptionComponent from "./CheckboxOption.vue";

export class CheckboxOption extends NodeInterface<boolean> {
    component = CheckboxOptionComponent;
}
