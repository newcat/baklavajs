import { NodeInterface, defineNode } from "@baklavajs/core";
import { TextareaInputInterface } from "../src/nodeinterfaces/textareainput/TextareaInputInterface";
import { TextInputInterface } from "../src";

export const DialogNode = defineNode({
    type: "dialog",
    title: "Dialogue",
    onCreate() {
        this.width = 400;
    },
    inputs: {
        input: () => new TextInputInterface("Title", ""),
        input2: () => new TextareaInputInterface("Description", ""),
    },
    outputs: {
        result: () => new NodeInterface("", ""),
    },
    calculate({ input, input2 }) {
        return { result: input + " " + input2 };
    },
});
