import { expect } from "chai";
import { spy } from "sinon";
import { NodeInterface } from "../src";
import TestNode from "./TestNode";

describe("Node", () => {
    it("generates an id", () => {
        const n = new TestNode();
        expect(n.id).to.not.be.empty;
    });

    it("allows getting all inputs", () => {
        const n = new TestNode();
        expect(Object.keys(n.inputs)).to.have.lengthOf(1);
    });

    it("allows getting all outputs", () => {
        const n = new TestNode();
        expect(Object.keys(n.outputs)).to.have.lengthOf(1);
    });

    it("can add an input", () => {
        const n = new TestNode();
        const t = Symbol("token");
        const beforeAddSpy = spy();
        const addSpy = spy();
        n.events.beforeAddInput.subscribe(t, beforeAddSpy);
        n.events.addInput.subscribe(t, addSpy);
        expect(Object.keys(n.inputs)).to.have.lengthOf(1);
        n["addInput"]("test", new NodeInterface("Test", 3));
        expect(Object.keys(n.inputs)).to.have.lengthOf(2);
        expect(beforeAddSpy.called).to.be.true;
        expect(addSpy.called).to.be.true;
    });

    it("can prevent adding an input", () => {
        const n = new TestNode();
        const t = Symbol("token");
        const addSpy = spy();
        n.events.beforeAddInput.subscribe(t, () => false);
        n.events.addInput.subscribe(t, addSpy);
        expect(Object.keys(n.inputs)).to.have.lengthOf(1);
        n["addInput"]("test", new NodeInterface("Test", 3));
        expect(Object.keys(n.inputs)).to.have.lengthOf(1);
        expect(addSpy.called).to.be.false;
    });

    it("can add an output", () => {
        const n = new TestNode();
        const t = Symbol("token");
        const beforeAddSpy = spy();
        const addSpy = spy();
        n.events.beforeAddOutput.subscribe(t, beforeAddSpy);
        n.events.addOutput.subscribe(t, addSpy);
        expect(Object.keys(n.outputs)).to.have.lengthOf(1);
        n["addOutput"]("test", new NodeInterface("Test", 3));
        expect(Object.keys(n.outputs)).to.have.lengthOf(2);
        expect(beforeAddSpy.called).to.be.true;
        expect(addSpy.called).to.be.true;
    });

    it("can prevent adding an output", () => {
        const n = new TestNode();
        const t = Symbol("token");
        const addSpy = spy();
        n.events.beforeAddOutput.subscribe(t, () => false);
        n.events.addOutput.subscribe(t, addSpy);
        expect(Object.keys(n.outputs)).to.have.lengthOf(1);
        n["addOutput"]("test", new NodeInterface("Test", 3));
        expect(Object.keys(n.outputs)).to.have.lengthOf(1);
        expect(addSpy.called).to.be.false;
    });

    it("correctly loads a state"); // TODO

    it("correctly saves a state"); // TODO
});
