import { markRaw } from "vue";
import { NodeInterface, defineNode } from "@baklavajs/core";
import ReactiveOutputTest from "./ReactiveOutputTest.vue";

class ReactiveOutputTestInterface extends NodeInterface<number> {
    constructor(name: string, value: number) {
        super(name, value);
        this.setComponent(markRaw(ReactiveOutputTest));
    }
}

export default defineNode({
    type: "ReactiveOutputTest",
    inputs: {
        a: () => new ReactiveOutputTestInterface("Test", 3),
    },
    outputs: {
        b: () => new ReactiveOutputTestInterface("Test", 1),
    },
});
