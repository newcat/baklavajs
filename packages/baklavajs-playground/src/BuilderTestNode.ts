import { defineNode, NodeInterface } from "@baklavajs/core";
import { TextInputInterface } from "@baklavajs/plugin-renderer-vue";

export default defineNode({
    type: "BuilderTestNode",
    inputs: {
        input1: () => new TextInputInterface("Input 1", "default1"),
        input2: () => new TextInputInterface("Input 2", "default2"),
        separator: () => new TextInputInterface("Separator", ","),
    },
    outputs: {
        output: () => new NodeInterface("Output", ""),
    },
    onCreate() {
        this.width = 400;
        this.twoColumn = true;
    },
    calculate({ input1, input2, separator }) {
        return {
            output: input1 + separator + input2,
        };
    },
});
