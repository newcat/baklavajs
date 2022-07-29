import { type AbstractNode, NodeInterface } from "../src";
import TestNode from "./TestNode";

describe("Node", () => {
    it("generates an id", () => {
        const n = new TestNode();
        expect(n.id).toBeTruthy();
    });

    it("allows getting all inputs", () => {
        const n = new TestNode();
        expect(Object.keys(n.inputs)).toHaveLength(1);
    });

    it("allows getting all outputs", () => {
        const n = new TestNode();
        expect(Object.keys(n.outputs)).toHaveLength(1);
    });

    it("can add an input", () => {
        const n = new TestNode();
        const t = Symbol("token");
        const beforeAddSpy = jest.fn();
        const addSpy = jest.fn();
        n.events.beforeAddInput.subscribe(t, beforeAddSpy);
        n.events.addInput.subscribe(t, addSpy);
        expect(Object.keys(n.inputs)).toHaveLength(1);
        n["addInput"]("test", new NodeInterface("Test", 3));
        expect(Object.keys(n.inputs)).toHaveLength(2);
        expect((n as AbstractNode).inputs.test.nodeId === n.id);
        expect(beforeAddSpy).toHaveBeenCalled();
        expect(addSpy).toHaveBeenCalled();
    });

    it("can prevent adding an input", () => {
        const n = new TestNode();
        const t = Symbol("token");
        const addSpy = jest.fn();
        n.events.beforeAddInput.subscribe(t, () => false);
        n.events.addInput.subscribe(t, addSpy);
        expect(Object.keys(n.inputs)).toHaveLength(1);
        n["addInput"]("test", new NodeInterface("Test", 3));
        expect(Object.keys(n.inputs)).toHaveLength(1);
        expect(addSpy).toHaveBeenCalledTimes(0);
    });

    it("can add an output", () => {
        const n = new TestNode();
        const t = Symbol("token");
        const beforeAddSpy = jest.fn();
        const addSpy = jest.fn();
        n.events.beforeAddOutput.subscribe(t, beforeAddSpy);
        n.events.addOutput.subscribe(t, addSpy);
        expect(Object.keys(n.outputs)).toHaveLength(1);
        n["addOutput"]("test", new NodeInterface("Test", 3));
        expect(Object.keys(n.outputs)).toHaveLength(2);
        expect((n as AbstractNode).outputs.test.nodeId === n.id);
        expect(beforeAddSpy).toHaveBeenCalled();
        expect(addSpy).toHaveBeenCalled();
    });

    it("can prevent adding an output", () => {
        const n = new TestNode();
        const t = Symbol("token");
        const addSpy = jest.fn();
        n.events.beforeAddOutput.subscribe(t, () => false);
        n.events.addOutput.subscribe(t, addSpy);
        expect(Object.keys(n.outputs)).toHaveLength(1);
        n["addOutput"]("test", new NodeInterface("Test", 3));
        expect(Object.keys(n.outputs)).toHaveLength(1);
        expect(addSpy).toHaveBeenCalledTimes(0);
    });

    it.todo("correctly loads a state"); // TODO

    it.todo("correctly saves a state"); // TODO
});
