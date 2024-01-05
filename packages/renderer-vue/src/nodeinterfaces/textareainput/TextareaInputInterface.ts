import { type ComponentOptions, markRaw } from "vue";
import { NodeInterface } from "@baklavajs/core";
import TextareaInputInterfaceComponent from "./TextareaInputInterface.vue";

export class TextareaInputInterface extends NodeInterface<string> {
    component = markRaw(TextareaInputInterfaceComponent) as ComponentOptions;
    // port = false;
}
