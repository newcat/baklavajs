import { defineNode, NodeInterface } from "../src";

describe("defineNode", () => {
    it("calls the onCreate lifecycle method correctly", () => {
        const onCreateSpy = jest.fn();
        const LifecycleTestNode = defineNode({
            type: "LifecycleTestNode",
            onCreate: onCreateSpy,
        });
        new LifecycleTestNode();
        expect(onCreateSpy).toHaveBeenCalled();
    });

    it("calls the onPlaced lifecycle method correctly", () => {
        const onPlacedSpy = jest.fn();
        const LifecycleTestNode = defineNode({
            type: "LifecycleTestNode",
            onPlaced: onPlacedSpy,
        });
        const n = new LifecycleTestNode();
        n.onPlaced();
        expect(onPlacedSpy).toHaveBeenCalled();
    });

    it("calls the onDestroy lifecycle method correctly", () => {
        const onDestroySpy = jest.fn();
        const LifecycleTestNode = defineNode({
            type: "LifecycleTestNode",
            onDestroy: onDestroySpy,
        });
        const n = new LifecycleTestNode();
        n.onDestroy();
        expect(onDestroySpy).toHaveBeenCalled();
    });

    it("correctly initializes inputs and outputs", () => {
        const TestNode = defineNode({
            type: "TestNode",
            inputs: {
                a: () => new NodeInterface("a", 1),
            },
            outputs: {
                b: () => new NodeInterface("b", "output"),
            },
        });
        const n = new TestNode();
        expect(n.inputs.a).toBeInstanceOf(NodeInterface);
        expect(n.inputs.a.value).toEqual(1);
        expect(n.outputs.b).toBeInstanceOf(NodeInterface);
        expect(n.outputs.b.value).toEqual("output");
    });

    it("calls the calculate method correctly", () => {
        const calculateSpy = jest.fn((inputs) => ({ b: (inputs.a + 1).toString() }));
        const TestNode = defineNode({
            type: "TestNode",
            inputs: {
                a: () => new NodeInterface("a", 1),
            },
            outputs: {
                b: () => new NodeInterface("b", "output"),
            },
            calculate: calculateSpy,
        });
        const n = new TestNode();
        const result = n.calculate!({ a: 4 }, { globalValues: { test: true }, engine: {} });
        expect(result).toEqual({ b: "5" });
        expect(calculateSpy).toHaveBeenCalledWith({ a: 4 }, { globalValues: { test: true }, engine: {} });
    });

    it("sets the title to the type if no title is specified", () => {
        const Nt = defineNode({ type: "test" });
        const n = new Nt();
        expect(n.title).toEqual("test");
    });

    it("doesnt override the title property if it is specified", () => {
        const Nt = defineNode({ type: "test", title: "title" });
        const n = new Nt();
        expect(n.title).toEqual("title");
    });
});
