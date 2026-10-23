import { defineDynamicNode, DynamicNodeDefinition, NodeInterface } from "@baklavajs/core";
import { SelectInterface } from "../src";

// Switching the mode removes the first output and appends a new one,
// so the outputs move without the node changing its size (#471)
export default defineDynamicNode({
    type: "ReorderTestNode",
    inputs: {
        mode: () => new SelectInterface("Mode", "A B C", ["A B C", "B C X"]).setPort(false),
    },
    onUpdate({ mode }) {
        const keys = mode === "A B C" ? ["a", "b", "c"] : ["b", "c", "x"];
        const outputs: DynamicNodeDefinition = {};
        for (const k of keys) {
            outputs[k] = () => new NodeInterface(k.toUpperCase(), 0);
        }
        return { outputs };
    },
});
