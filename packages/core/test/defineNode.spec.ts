import { expect } from "chai";
import { spy } from "sinon";
import { defineNode } from "../src";

describe("defineNode", () => {
    it("calls the onCreate lifecycle method correctly", () => {
        const onCreateSpy = spy();
        const LifecycleTestNode = defineNode({
            type: "LifecycleTestNode",
            onCreate: onCreateSpy,
        });
        new LifecycleTestNode();
        expect(onCreateSpy.called).to.be.true;
    });
});
