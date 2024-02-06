import { NodeInterface, defineNode } from "@baklavajs/core";
import { allowMultipleConnections } from "@baklavajs/engine";
import { setTypeForMultipleConnections } from "@baklavajs/interface-types";
import { stringType } from "./interfaceTypes";
import { TextInterface } from "../src";

export default defineNode({
    type: "MultiInputNode",
    inputs: {
        data: () =>
            new NodeInterface<string[]>("Data", [])
                .use(allowMultipleConnections)
                .use(setTypeForMultipleConnections, stringType),
    },
    outputs: {
        output: () => new NodeInterface("Output", ""),
    },
    calculate({ data }) {
        return { output: data.join(", ") };
    },
});
