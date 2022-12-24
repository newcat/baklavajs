import { defineDynamicNode, DynamicNodeDefinition, NodeInterface } from "../src";

describe("Dynamic Node", () => {
    const DynNode = defineDynamicNode({
        type: "DynNode",
        inputs: {
            numIntfs: () => new NodeInterface<number>("Num Intfs", 0),
        },
        outputs: {
            staticOut: () => new NodeInterface("Static Out", "static"),
        },
        onUpdate({ numIntfs }) {
            const outputs: DynamicNodeDefinition = {};
            const inputs: DynamicNodeDefinition = {};
            for (let i = 0; i < numIntfs; i++) {
                inputs[`intf${i}`] = () => new NodeInterface(`Intf ${i}`, 0);
                outputs[`intf${i}`] = () => new NodeInterface(`Intf ${i}`, 0);
            }
            return { inputs, outputs };
        },
    });

    it("dynamically updates interfaces as needed", () => {
        const dn = new DynNode();
        expect(Object.keys(dn.inputs)).toHaveLength(1);
        expect(Object.keys(dn.outputs)).toHaveLength(1);
        dn.inputs.numIntfs.value = 10;
        expect(Object.keys(dn.inputs)).toHaveLength(11);
        expect(Object.keys(dn.outputs)).toHaveLength(11);
        dn.inputs.numIntfs.value = 2;
        expect(Object.keys(dn.inputs)).toHaveLength(3);
        expect(Object.keys(dn.outputs)).toHaveLength(3);
    });

    it("calls the onCreate lifecycle method correctly", () => {
        const onCreateSpy = jest.fn();
        const LifecycleTestNode = defineDynamicNode({
            type: "LifecycleTestNode",
            onUpdate: () => ({}),
            onCreate: onCreateSpy,
        });
        new LifecycleTestNode();
        expect(onCreateSpy).toHaveBeenCalled();
    });

    it("calls the onPlaced lifecycle method correctly", () => {
        const onPlacedSpy = jest.fn();
        const LifecycleTestNode = defineDynamicNode({
            type: "LifecycleTestNode",
            onUpdate: () => ({}),
            onPlaced: onPlacedSpy,
        });
        const n = new LifecycleTestNode();
        n.onPlaced();
        expect(onPlacedSpy).toHaveBeenCalled();
    });

    it("calls the onDestroy lifecycle method correctly", () => {
        const onDestroySpy = jest.fn();
        const LifecycleTestNode = defineDynamicNode({
            type: "LifecycleTestNode",
            onUpdate: () => ({}),
            onDestroy: onDestroySpy,
        });
        const n = new LifecycleTestNode();
        n.onDestroy();
        expect(onDestroySpy).toHaveBeenCalled();
    });

    it("correctly initializes static inputs and outputs", () => {
        const TestNode = defineDynamicNode({
            type: "TestNode",
            inputs: {
                a: () => new NodeInterface("a", 1),
            },
            outputs: {
                b: () => new NodeInterface("b", "output"),
            },
            onUpdate: () => ({}),
        });
        const n = new TestNode();
        expect(n.inputs.a).toBeInstanceOf(NodeInterface);
        expect(n.inputs.a.value).toEqual(1);
        expect(n.outputs.b).toBeInstanceOf(NodeInterface);
        expect(n.outputs.b.value).toEqual("output");
    });

    it("calls the calculate method correctly", () => {
        // TODO: Also include custom inputs and outputs
        const calculateSpy = jest.fn((inputs) => ({ b: (inputs.a + 1).toString() }));
        const TestNode = defineDynamicNode({
            type: "TestNode",
            inputs: {
                a: () => new NodeInterface("a", 1),
            },
            outputs: {
                b: () => new NodeInterface("b", "output"),
            },
            calculate: calculateSpy,
            onUpdate: () => ({}),
        });
        const n = new TestNode();
        const result = n.calculate!({ a: 4 }, { globalValues: { test: true }, engine: {} });
        expect(result).toEqual({ b: "5" });
        expect(calculateSpy).toHaveBeenCalledWith({ a: 4 }, { globalValues: { test: true }, engine: {} });
    });

    it("sets the title to the type if no title is specified", () => {
        const Nt = defineDynamicNode({ type: "test", onUpdate: () => ({}) });
        const n = new Nt();
        expect(n.title).toEqual("test");
    });

    it("doesnt override the title property if it is specified", () => {
        const Nt = defineDynamicNode({ type: "test", title: "title", onUpdate: () => ({}) });
        const n = new Nt();
        expect(n.title).toEqual("title");
    });

    it("correctly saves and loads", () => {
        const dn = new DynNode();
        dn.inputs.numIntfs.value = 3;
        dn.outputs.staticOut.value = "test";
        dn.inputs.intf2.value = 20;
        const state = dn.save();

        const dn2 = new DynNode();
        dn2.load(state);
        expect(dn2.save()).toEqual(state);
    });
});
