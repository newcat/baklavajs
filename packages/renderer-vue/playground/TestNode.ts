import { defineNode } from "@baklavajs/core";
import { CheckboxInterface, NumberInterface, TextInputInterface, SelectInterface, SliderInterface } from "../src";

export default defineNode({
    type: "TestNode",
    inputs: {
        input: () => new CheckboxInterface("Input", false),
        test: () => new NumberInterface("Test", 5),
        test2: () => new TextInputInterface("test", "").setPort(false),
        select: () => new SelectInterface("Select", "Test1", ["Test1", "Test2", "Test3"]).setPort(false),
        checkbox: () => new CheckboxInterface("This is a checkbox", true).setPort(false),
        number: () => new NumberInterface("Number", 5, 0, 10).setPort(false),
        slider: () => new SliderInterface("Slider", 0.5, 0, 1).setPort(false),
    },
    outputs: {
        output: () => new CheckboxInterface("Output", false),
    },
    calculate({ input }) {
        return { output: input };
    },
});
