import { expect } from "chai";
import { spy } from "sinon";
import { NodeInterface } from "../src";

describe("Node Interface", () => {
    it("generates an id", () => {
        const ni = new NodeInterface("Test", "test");
        expect(ni.id).to.not.be.empty;
    });

    it("can set and get the value", () => {
        const ni = new NodeInterface("Test", "test");
        ni.value = "myValue";
        expect(ni.value).to.equal("myValue");
    });

    it("calls the 'beforeSetValue' and 'setValue' events when a value is set", () => {
        const spy1 = spy();
        const spy2 = spy();
        const newValue = "myValue";
        const ni = new NodeInterface("Test", "test");
        ni.events.beforeSetValue.subscribe(Symbol(), spy1);
        ni.events.setValue.subscribe(Symbol(), spy2);
        ni.value = newValue;
        expect(spy1.called).to.be.true;
        expect(spy2.called).to.be.true;
        expect(spy1.firstCall.args[0]).to.equal("myValue");
        expect(spy2.firstCall.args[0]).to.equal("myValue");
    });

    it("correctly loads a state"); // TODO

    it("correctly saves a state"); // TODO
});
