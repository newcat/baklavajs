import { defineNode } from "@baklavajs/core";
import { TextInputInterface, CheckboxInterface, TextInterface } from "../src";

export default defineNode({
    type: "OutputNode",
    inputs: {
        text: () => new TextInputInterface("Text", ""),
        boolean: () => new CheckboxInterface("Boolean", false),
    },
    outputs: {
        text: () => new TextInterface("output", "").setPort(false),
        data: () => new TextInterface("data", "test").setHidden(true),
    },
    calculate({ text }) {
        return { text, data: text };
    },
});
