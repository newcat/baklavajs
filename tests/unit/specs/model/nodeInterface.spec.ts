import { expect } from "chai";
import { spy } from "sinon";
import { NodeInterface, NodeBuilder } from "@/index";

const n = new (new NodeBuilder("CustomNode").build())();

describe("Node Interface", () => {

    it("generates an id", () => {
        const ni = new NodeInterface(n, true, "myType");
        expect(ni.id).to.satisfy((s: string) => s.startsWith("ni_"));
    });

    it("can set and get the value", () => {
        const ni = new NodeInterface(n, true, "myType");
        ni.value = "myValue";
        expect(ni.value).to.equal("myValue");
    });

    it("calls all listeners when a value is set", () => {
        const spy1 = spy();
        const spy2 = spy();
        const newValue = "myValue";
        const ni = new NodeInterface(n, true, "myType");
        ni.registerListener(spy1);
        ni.registerListener(spy2);
        ni.value = newValue;
        expect(spy1.called).to.be.true;
        expect(spy2.called).to.be.true;
        expect(spy1.firstCall.args[0]).to.equal("myValue");
        expect(spy2.firstCall.args[0]).to.equal("myValue");
    });

    it("correctly loads a state"); // TODO

    it("correctly saves a state"); // TODO

    it("can unregister a listener", () => {
        const spy1 = spy();
        const ni = new NodeInterface(n, true, "myType");
        const unsubscribe = ni.registerListener(spy1);
        unsubscribe();
        ni.value = "test";
        expect(spy1.called).to.be.false;
    });

});
