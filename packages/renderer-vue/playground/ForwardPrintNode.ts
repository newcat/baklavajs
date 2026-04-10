import { defineNode, NodeInterface } from "@baklavajs/core";
import { ExecutionFlowInterface } from "@baklavajs/engine";
import { TextInterface } from "../src";

export default defineNode({
    type: "ForwardPrintNode",
    title: "Print",
    inputs: {
        execIn: () => new ExecutionFlowInterface("Exec"),
        value: () => new NodeInterface<unknown>("Value", ""),
    },
    outputs: {
        execOut: () => new ExecutionFlowInterface("Exec"),
        output: () => new TextInterface("Output", "").setPort(false),
    },
    calculate({ value }) {
        const text = Array.isArray(value) ? JSON.stringify(value) : String(value);
        console.log("[ForwardEngine Print]", text);
        return { execOut: true, output: text };
    },
});
