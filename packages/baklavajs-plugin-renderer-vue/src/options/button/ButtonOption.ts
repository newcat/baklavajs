import { NodeOption } from "@baklavajs/core";
import ButtonOptionComponent from "./ButtonOption.vue";

export class ButtonOption extends NodeOption<never> {
    public component = ButtonOptionComponent;
    public callback?: () => void;
}
