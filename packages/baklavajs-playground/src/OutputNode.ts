import { defineNode } from "@baklavajs/core";
import { TextInputInterface, CheckboxInterface, TextInterface } from "@baklavajs/plugin-renderer-vue";

export default defineNode({
    type: "OutputNode",
    inputs: {
        text: () => new TextInputInterface("Text", ""),
        boolean: () => new CheckboxInterface("Boolean", false),
    },
    outputs: {
        text: () => new TextInterface("output", "").setPort(false),
        data: () => new TextInterface("data", "").setPort(false),
    },
    calculate({ text }, data) {
        return { text, data: String(data) };
    },
});
