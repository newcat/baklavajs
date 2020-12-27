import { defineNode, NodeInterface } from "@baklavajs/core";
import { SelectInterface } from "@baklavajs/plugin-renderer-vue";

export default defineNode({
    type: "SelectTestNode",
    inputs: {
        simple: () => new SelectInterface("Simple", "A", ["A", "B", "C"]),
        advanced: () =>
            new SelectInterface("Advanced", 3, [
                { text: "X", value: 1 },
                { text: "Y", value: 2 },
                { text: "Z", value: 3 },
            ]),
    },
    outputs: {
        simple: () => new NodeInterface("Simple", ""),
        advanced: () => new NodeInterface("Advanced", 0),
    },
    calculate({ simple, advanced }) {
        return { simple: simple!, advanced: advanced! };
    },
});
