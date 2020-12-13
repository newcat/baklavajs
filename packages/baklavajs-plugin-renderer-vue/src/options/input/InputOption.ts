import { NodeOption } from "@baklavajs/core";
import InputOptionComponent from "./InputOption.vue";

export class InputOption extends NodeOption<string> {
    component = InputOptionComponent;
}
