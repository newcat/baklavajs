import { defineNode, NodeInterface } from "@baklavajs/core";
import { ExecutionFlowInterface, ForwardCalculationContext } from "@baklavajs/engine";
import { NumberInterface } from "../src";

export default defineNode({
    type: "ForwardForLoopNode",
    title: "For Loop",
    inputs: {
        execIn: () => new ExecutionFlowInterface("Exec"),
        start: () => new NumberInterface("Start", 0),
        end: () => new NumberInterface("End", 5),
    },
    outputs: {
        loopBody: () => new ExecutionFlowInterface("Loop Body"),
        completed: () => new ExecutionFlowInterface("Completed"),
        index: () => new NodeInterface<number>("Index", 0),
    },
    async calculate({ start, end }, context) {
        const { executeOutput } = context as ForwardCalculationContext;
        for (let i = start; i < end; i++) {
            await executeOutput("loopBody", { index: i });
        }
        return { loopBody: false, completed: true, index: end };
    },
});
