import { defineNode } from "@baklavajs/core";
import {
    ButtonInterface,
    CheckboxInterface,
    IntegerInterface,
    NumberInterface,
    SelectInterface,
    SliderInterface,
    TextInputInterface,
    TextInterface,
} from "@baklavajs/plugin-renderer-vue";

export default defineNode({
    type: "InterfaceTestNode",
    inputs: {
        button: () => new ButtonInterface("ButtonInterface", () => alert("It works")),
        checkbox: () => new CheckboxInterface("CheckboxInterface", false),
        integer: () => new IntegerInterface("IntegerInterface", 5, 0, 10),
        number: () => new NumberInterface("NumberInterface", 0.5, 0, 1),
        select: () => new SelectInterface("SelectInterface", "Value 1", ["Value 1", "Value 2", "Value 3"]),
        slider: () => new SliderInterface("SliderInterface", 0.5, 0, 1),
        textInput: () => new TextInputInterface("TextInputInterface", ""),
        text: () => new TextInterface("TextInterface", "My text"),
    },
});
