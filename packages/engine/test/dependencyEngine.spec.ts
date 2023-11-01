import { Editor, NodeInterface, defineNode } from "@baklavajs/core";
import { TestNode } from "./testNode";
import {
    AfterNodeCalculationEventData,
    BeforeNodeCalculationEventData,
    DependencyEngine,
    allowMultipleConnections,
} from "../src";

describe("DependencyEngine", () => {
    it("emits the beforeNodeCalculation and afterNodeCalculation events", async () => {
        const editor = new Editor();
        const n1 = editor.graph.addNode(new TestNode())!;
        const n2 = editor.graph.addNode(new TestNode())!;
        editor.graph.addConnection(n1.outputs.c, n2.inputs.a);

        const engine = new DependencyEngine<void>(editor);
        const beforeSpy = jest.fn();
        const afterSpy = jest.fn();
        engine.events.beforeNodeCalculation.subscribe("a", beforeSpy);
        engine.events.afterNodeCalculation.subscribe("b", afterSpy);

        n1.inputs.a.value = 2;
        n1.inputs.b.value = 3;
        n2.inputs.b.value = 4;

        await engine.runOnce();

        expect(beforeSpy).toHaveBeenCalledTimes(2);
        expect(beforeSpy.mock.calls[0][0]).toEqual({
            node: n1,
            inputValues: {
                a: 2,
                b: 3,
            },
        } as BeforeNodeCalculationEventData);
        expect(beforeSpy.mock.calls[1][0]).toEqual({
            node: n2,
            inputValues: {
                a: 5,
                b: 4,
            },
        } as BeforeNodeCalculationEventData);

        expect(afterSpy).toHaveBeenCalledTimes(2);
        expect(afterSpy.mock.calls[0][0]).toEqual({
            node: n1,
            outputValues: {
                c: 5,
                d: -1,
            },
        } as AfterNodeCalculationEventData);
        expect(afterSpy.mock.calls[1][0]).toEqual({
            node: n2,
            outputValues: {
                c: 9,
                d: 1,
            },
        } as AfterNodeCalculationEventData);
    });

    it("handles nodes without a calculate method", async () => {
        const editor = new Editor();
        const NoCalculationNode = defineNode({ type: "NoCalculation" });
        editor.graph.addNode(new NoCalculationNode());
        const engine = new DependencyEngine<void>(editor);
        expect(await engine.runOnce()).toEqual(new Map());
    });

    it("allows using multiple connections", async () => {
        const editor = new Editor();
        const spy = jest.fn();
        const MultiNode = defineNode({
            type: "MultiNode",
            inputs: {
                a: () => new NodeInterface<number[]>("a", [0]).use(allowMultipleConnections),
            },
            calculate({ a }) {
                spy(a);
                return {};
            },
        });
        const n1 = editor.graph.addNode(new TestNode())!;
        const n2 = editor.graph.addNode(new MultiNode())!;
        editor.graph.addConnection(n1.outputs.c, n2.inputs.a);
        editor.graph.addConnection(n1.outputs.d, n2.inputs.a);

        const engine = new DependencyEngine<void>(editor);
        await engine.runOnce();

        expect(spy).toHaveBeenCalledWith([2, 0]);
    });

    it("handles nodes without calculate functions", async () => {
        const editor = new Editor();
        const NoCalculateNode = defineNode({
            type: "NoCalculateNode",
            outputs: {
                a: () => new NodeInterface("a", 3),
            }
        });
        const n1 = editor.graph.addNode(new NoCalculateNode())!;
        const n2 = editor.graph.addNode(new TestNode())!;
        editor.graph.addConnection(n1.outputs.a, n2.inputs.a);

        const engine = new DependencyEngine<void>(editor);
        const result = await engine.runOnce();

        expect(result).toMatchSnapshot();
    });
});
