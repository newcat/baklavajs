import { defineNode } from "@baklavajs/core";
import { createExecInterface } from "@baklavajs/engine";
import { CheckboxInterface } from "../src";

export default defineNode({
    type: "ForwardBranchNode",
    title: "Branch",
    inputs: {
        execIn: () => createExecInterface("Exec"),
        condition: () => new CheckboxInterface("Condition", false),
    },
    outputs: {
        trueExec: () => createExecInterface("True"),
        falseExec: () => createExecInterface("False"),
    },
    calculate({ condition }) {
        return { trueExec: !!condition, falseExec: !condition };
    },
});
