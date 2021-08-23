import { defineNode, NodeInterface } from "../src";

export default defineNode({
    type: "OutputNode",
    inputs: {
        input: () => new NodeInterface("test", 3),
    },
});
