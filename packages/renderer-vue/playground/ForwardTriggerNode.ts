import { defineNode, NodeInterface } from "@baklavajs/core";
import { ExecutionFlowInterface } from "@baklavajs/engine";
import { NumberInterface } from "../src";

export default defineNode({
    type: "ForwardTriggerNode",
    title: "Trigger",
    inputs: {
        value: () => new NumberInterface("Value", 42),
    },
    outputs: {
        execOut: () => new ExecutionFlowInterface("Exec"),
        value: () => new NodeInterface<number>("Value", 0),
    },
    calculate({ value }) {
        return { execOut: true, value };
    },
});
