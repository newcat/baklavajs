import { defineNode } from "@baklavajs/core";
import { ExecutionFlowInterface } from "@baklavajs/engine";
import { CheckboxInterface } from "../src";

export default defineNode({
    type: "ForwardBranchNode",
    title: "Branch",
    inputs: {
        execIn: () => new ExecutionFlowInterface("Exec"),
        condition: () => new CheckboxInterface("Condition", false),
    },
    outputs: {
        trueExec: () => new ExecutionFlowInterface("True"),
        falseExec: () => new ExecutionFlowInterface("False"),
    },
    calculate({ condition }) {
        return { trueExec: !!condition, falseExec: !condition };
    },
});
