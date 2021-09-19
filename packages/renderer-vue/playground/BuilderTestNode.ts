// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../src/overrides.ts" />

import { defineNode, NodeInterface } from "@baklavajs/core";
import { setType } from "@baklavajs/plugin-interface-types";
import { TextInputInterface } from "../src";
import { stringType } from "./interfaceTypes";

export default defineNode({
    type: "BuilderTestNode",
    inputs: {
        input1: () => new TextInputInterface("Input 1", "default1").use(setType, stringType),
        input2: () => new TextInputInterface("Input 2", "default2").use(setType, stringType),
        separator: () => new TextInputInterface("Separator", ",").use(setType, stringType),
    },
    outputs: {
        output: () => new NodeInterface("Output", "").use(setType, stringType),
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
