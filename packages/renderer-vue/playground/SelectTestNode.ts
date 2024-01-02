import { defineNode, NodeInterface } from "@baklavajs/core";
import { setType } from "@baklavajs/interface-types";
import { SelectInterface } from "../src";
import { numberType, stringType } from "./interfaceTypes";

export default defineNode({
    type: "SelectTestNode",
    inputs: {
        simple: () => new SelectInterface("Simple", "A", ["A", "B", "C"]).use(setType, stringType),
        advanced: () =>
            new SelectInterface("Advanced", 3, [
                { text: "X", value: 1 },
                { text: "Y", value: 2 },
                { text: "Z", value: 3 },
            ]).use(setType, numberType),
    },
    outputs: {
        simple: () => new NodeInterface("Simple", "").use(setType, stringType),
        advanced: () => new NodeInterface("Advanced", 0).use(setType, numberType),
    },
    calculate({ simple, advanced }) {
        return { simple: simple, advanced: advanced };
    },
});
