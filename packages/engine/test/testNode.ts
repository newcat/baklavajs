import { defineNode, NodeInterface } from "@baklavajs/core";

export const TestNode = defineNode({
    type: "TestNode",
    inputs: {
        a: () => new NodeInterface("A", 1),
        b: () => new NodeInterface("B", 1),
    },
    outputs: {
        c: () => new NodeInterface("C", 1),
        d: () => new NodeInterface("D", 1),
    },
    calculate({ a, b }) {
        return {
            c: a + b,
            d: a - b,
        };
    },
});
